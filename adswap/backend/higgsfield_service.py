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

BASE_URL = "https://api.higgsfield.ai/v1"

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


async def _real_swap(
    video_path: Path,
    transcript: dict,
    avatar_label: str,
    variation_index: int,
    output_dir: Path,
) -> dict:
    import httpx

    headers = {"Authorization": f"Bearer {config.HIGGSFIELD_API_KEY}"}

    async with httpx.AsyncClient(timeout=120) as client:
        # 1. Upload the source media.
        with video_path.open("rb") as fh:
            up = await client.post(
                f"{BASE_URL}/media",
                headers=headers,
                files={"file": (video_path.name, fh, "video/mp4")},
            )
        up.raise_for_status()
        media_id = up.json().get("id")

        # 2. Start the character-swap job.
        start = await client.post(
            f"{BASE_URL}/jobs",
            headers={**headers, "Content-Type": "application/json"},
            json={
                "type": "character_swap",
                "media_id": media_id,
                "avatar_prompt": avatar_label,
                "transcript": transcript.get("text", ""),
                "lip_sync": True,
            },
        )
        start.raise_for_status()
        job_id = start.json().get("id")

        # 3. Poll until done (cap ~5 min).
        video_url = None
        for _ in range(100):
            await asyncio.sleep(3)
            poll = await client.get(f"{BASE_URL}/jobs/{job_id}", headers=headers)
            poll.raise_for_status()
            body = poll.json()
            status = body.get("status")
            if status in {"completed", "complete", "succeeded"}:
                video_url = body.get("output_url") or body.get("result", {}).get("url")
                break
            if status in {"failed", "error"}:
                raise RuntimeError(f"Higgsfield job {job_id} failed: {body}")
        if not video_url:
            raise TimeoutError(f"Higgsfield job {job_id} did not complete in time")

        # 4. Download the result.
        out_video = output_dir / f"variation_{variation_index + 1}.mp4"
        dl = await client.get(video_url, headers=headers)
        dl.raise_for_status()
        out_video.write_bytes(dl.content)

    out_thumb = output_dir / f"variation_{variation_index + 1}.svg"
    _write_thumbnail(out_thumb, avatar_label, variation_index)
    return {
        "status": "complete",
        "video_filename": out_video.name,
        "thumbnail_filename": out_thumb.name,
        "external_job_id": job_id,
        "mock": False,
    }
