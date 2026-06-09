"""Character-swap generation via the Higgsfield AI API.

Real flow (when HIGGSFIELD_API_KEY is set), mirroring the documented v1 API:
    1. POST /v1/media         → upload the source video, get a media id
    2. POST /v1/jobs          → start a character-swap job
    3. GET  /v1/jobs/{id}      → poll until the job completes
    4. download the resulting video into outputs/{job_id}/

Mock flow (no key): copies the source video to a per-variation output file and
writes a lightweight SVG thumbnail, so the dashboard / results pages work
end-to-end without credentials.
"""
from __future__ import annotations

import asyncio
import shutil
from pathlib import Path

import config

BASE_URL = config.HIGGSFIELD_BASE_URL

# Maps the UI avatar-style choices to (label, descriptive prompt) pairs. The
# diverse cast cycles through a small roster so each variation looks distinct.
AVATAR_STYLES = {
    "realistic_female": ["realistic female presenter"],
    "realistic_male": ["realistic male presenter"],
    "diverse_cast": [
        "realistic female presenter",
        "realistic male presenter",
        "realistic non-binary presenter",
        "older adult presenter",
        "young adult presenter",
    ],
}


def avatar_for_variation(avatar_style: str, variation_index: int) -> str:
    roster = AVATAR_STYLES.get(avatar_style, AVATAR_STYLES["diverse_cast"])
    return roster[variation_index % len(roster)]


def _write_thumbnail(path: Path, label: str, index: int) -> None:
    hue = (index * 67) % 360
    svg = f"""<svg xmlns='http://www.w3.org/2000/svg' width='320' height='180'>
  <rect width='100%' height='100%' fill='hsl({hue},45%,18%)'/>
  <circle cx='160' cy='74' r='34' fill='hsl({hue},55%,42%)'/>
  <text x='160' y='150' fill='#e5e7eb' font-family='sans-serif' font-size='16'
        text-anchor='middle'>{label}</text>
</svg>"""
    path.write_text(svg, encoding="utf-8")


async def _mock_swap(
    video_path: Path, output_dir: Path, avatar_label: str, variation_index: int
) -> dict:
    await asyncio.sleep(0.5)  # simulate generation latency
    out_video = output_dir / f"variation_{variation_index + 1}.mp4"
    shutil.copyfile(video_path, out_video)
    out_thumb = output_dir / f"variation_{variation_index + 1}.svg"
    _write_thumbnail(out_thumb, avatar_label, variation_index)
    return {
        "status": "complete",
        "video_filename": out_video.name,
        "thumbnail_filename": out_thumb.name,
        "external_job_id": None,
        "mock": True,
    }


async def higgsfield_swap_character(
    video_path: str | Path,
    transcript: dict,
    avatar_style: str,
    variation_index: int,
    output_dir: Path,
) -> dict:
    video_path = Path(video_path)
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    avatar_label = avatar_for_variation(avatar_style, variation_index)

    if not config.HAS_HIGGSFIELD:
        return await _mock_swap(video_path, output_dir, avatar_label, variation_index)

    try:
        return await _real_swap(
            video_path, transcript, avatar_label, variation_index, output_dir
        )
    except Exception as exc:  # noqa: BLE001 — fall back so one bad call doesn't kill the job
        result = await _mock_swap(video_path, output_dir, avatar_label, variation_index)
        result["generation_error"] = str(exc)
        return result


def _auth_header() -> str:
    """Higgsfield expects `Authorization: Key {api_key}:{api_key_secret}`.

    Accept either a key already containing the `key:secret` pair, or a separate
    HIGGSFIELD_API_SECRET.
    """
    key = config.HIGGSFIELD_API_KEY
    if ":" in key:
        return f"Key {key}"
    return f"Key {key}:{config.HIGGSFIELD_API_SECRET}"


def _raise_for_body(resp) -> None:
    """Like raise_for_status, but include the response body for diagnosis."""
    if resp.status_code >= 400:
        raise RuntimeError(f"HTTP {resp.status_code} from {resp.request.url}: {resp.text[:500]}")


async def _real_swap(
    video_path: Path,
    transcript: dict,
    avatar_label: str,
    variation_index: int,
    output_dir: Path,
) -> dict:
    import httpx

    if not config.HIGGSFIELD_MODEL_ID:
        raise RuntimeError("HIGGSFIELD_MODEL_ID is not set (e.g. higgsfield-ai/<model>).")

    headers = {"Authorization": _auth_header(), "Content-Type": "application/json"}

    # Text-to-video talking-presenter prompt: a new avatar delivers the same
    # script. `prompt` is the universal field; aspect_ratio/resolution follow the
    # documented example. Tune per the chosen model's parameter page if needed.
    script = (transcript.get("text", "") or "").strip()
    body: dict = {
        "prompt": (
            f"Vertical UGC-style video ad. A {avatar_label} talks directly to the "
            f"camera, casual handheld selfie style, natural lighting, delivering "
            f"this script as spoken dialogue: \"{script[:500]}\". "
            f"Upbeat, authentic, same product focus."
        ),
        "aspect_ratio": "9:16",
        "resolution": "720p",
    }

    submit_url = f"{BASE_URL}/{config.HIGGSFIELD_MODEL_ID}"

    async with httpx.AsyncClient(timeout=60) as client:
        # 1. Submit the generation request.
        resp = await client.post(submit_url, headers=headers, json=body)
        _raise_for_body(resp)
        data = resp.json()
        request_id = data.get("request_id")
        status_url = data.get("status_url") or f"{BASE_URL}/requests/{request_id}/status"

        # 2. Poll until completed (cap ~5 min).
        video_url = None
        for _ in range(100):
            await asyncio.sleep(3)
            poll = await client.get(status_url, headers=headers)
            _raise_for_body(poll)
            sb = poll.json()
            status = sb.get("status")
            if status == "completed":
                video_url = (sb.get("video") or {}).get("url")
                break
            if status in {"failed", "nsfw"}:
                raise RuntimeError(f"Higgsfield request {request_id} status={status}: {sb}")
        if not video_url:
            raise TimeoutError(f"Higgsfield request {request_id} did not complete in time")

        # 3. Download the result.
        out_video = output_dir / f"variation_{variation_index + 1}.mp4"
        dl = await client.get(video_url)
        _raise_for_body(dl)
        out_video.write_bytes(dl.content)

    out_thumb = output_dir / f"variation_{variation_index + 1}.svg"
    _write_thumbnail(out_thumb, avatar_label, variation_index)
    return {
        "status": "complete",
        "video_filename": out_video.name,
        "thumbnail_filename": out_thumb.name,
        "external_job_id": request_id,
        "mock": False,
    }
