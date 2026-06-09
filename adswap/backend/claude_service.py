"""Scene analysis via the Anthropic Claude API.

Sends sampled video frames + the Whisper transcript to Claude and asks it to
classify the ad's structure (UGC talking segments vs product B-roll), tone,
hooks, and CTA timestamps.

Falls back to a deterministic mock analysis when ANTHROPIC_API_KEY is absent or
when frames cannot be extracted (e.g. ffmpeg not installed).
"""
from __future__ import annotations

import asyncio
import base64
import json
from pathlib import Path
from typing import Any

import config

SYSTEM_PROMPT = (
    "You are a UGC ad-analysis engine. Given sampled frames from a short user-"
    "generated-content video ad and its transcript with timestamps, analyze the "
    "ad's structure in detail. Break the ad into time segments; for EACH segment "
    "give a short label for its role (e.g. Hook, Problem, Demo, Feature, "
    "Testimonial, B-roll, Call to action), classify it as ugc_talking or "
    "product_broll, and write a vivid one-sentence description of what is happening "
    "on screen and what is said. Also give a 1-2 sentence overall summary of the "
    "ad's narrative flow, the overall tone, the hook(s), and the call-to-action "
    "timestamps. Finally identify THE PRODUCT being advertised and describe it "
    "precisely enough that an image model could recreate it faithfully: its "
    "name/category, exact color(s), shape, relative size, material/finish, and any "
    "visible text, logo, or labeling. Respond ONLY with JSON matching the requested "
    "schema."
)

# JSON schema we ask Claude to fill in (described in the prompt for older models
# that predate structured outputs).
SCHEMA_HINT = {
    "summary": "1-2 sentence overview of the ad's narrative flow",
    "segments": [
        {
            "start": "float seconds",
            "end": "float seconds",
            "type": "one of: ugc_talking | product_broll",
            "label": "role, e.g. Hook | Problem | Demo | Feature | Testimonial | B-roll | Call to action",
            "description": "vivid one-sentence description of what happens on screen and what is said",
        }
    ],
    "tone": "string",
    "hooks": [{"timestamp": "float seconds", "text": "string"}],
    "cta_timestamps": ["float seconds"],
    "product": {
        "name": "short product name/category",
        "description": "precise visual description: color(s), shape, size, material/finish, visible text or logo",
        "colors": ["dominant color words"],
    },
}


def _mock_analysis(transcript: dict) -> dict:
    segments = transcript.get("segments") or []
    out_segments = []
    n = len(segments)
    for i, seg in enumerate(segments):
        if i == 0:
            label = "Hook"
        elif i == n - 1:
            label = "Call to action"
        else:
            label = "Demo" if i % 2 else "Feature"
        out_segments.append(
            {
                "start": seg.get("start", 0.0),
                "end": seg.get("end", 0.0),
                # Treat the final segment (the CTA) as the only B-roll moment.
                "type": "product_broll" if i == n - 1 else "ugc_talking",
                "label": label,
                "description": seg.get("text", "")[:120],
            }
        )
    cta = [segments[-1]["start"]] if segments else []
    return {
        "summary": "Creator hooks the viewer, walks through the product, and ends on a call to action.",
        "segments": out_segments,
        "tone": "casual, enthusiastic, authentic",
        "hooks": [{"timestamp": 0.0, "text": segments[0]["text"]}] if segments else [],
        "cta_timestamps": cta,
        "product": {
            "name": "the featured product",
            "description": "the product shown in the original video",
            "colors": [],
        },
        "mock": True,
    }


def _frames_to_blocks(frame_paths: list[Path]) -> list[dict[str, Any]]:
    blocks: list[dict[str, Any]] = []
    for p in frame_paths:
        media_type = "image/jpeg" if p.suffix.lower() in {".jpg", ".jpeg"} else "image/png"
        data = base64.standard_b64encode(p.read_bytes()).decode("ascii")
        blocks.append(
            {
                "type": "image",
                "source": {"type": "base64", "media_type": media_type, "data": data},
            }
        )
    return blocks


async def claude_analyze_scenes(
    transcript: dict, frame_paths: list[Path] | None = None
) -> dict:
    frame_paths = frame_paths or []

    if not config.HAS_ANTHROPIC:
        await asyncio.sleep(0.2)
        return _mock_analysis(transcript)

    def _call() -> dict:
        import anthropic

        client = anthropic.Anthropic(api_key=config.ANTHROPIC_API_KEY)

        content: list[dict[str, Any]] = _frames_to_blocks(frame_paths)
        content.append(
            {
                "type": "text",
                "text": (
                    "Transcript (JSON):\n"
                    + json.dumps(transcript.get("segments", []), indent=2)
                    + "\n\nReturn JSON only, matching this schema:\n"
                    + json.dumps(SCHEMA_HINT, indent=2)
                ),
            }
        )

        msg = client.messages.create(
            model=config.CLAUDE_MODEL,
            max_tokens=2048,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": content}],
        )
        text = "".join(b.text for b in msg.content if b.type == "text").strip()
        # Claude may wrap JSON in a markdown fence; strip it.
        if text.startswith("```"):
            text = text.split("```", 2)[1]
            if text.startswith("json"):
                text = text[4:]
        analysis = json.loads(text)
        analysis["mock"] = False
        return analysis

    try:
        return await asyncio.to_thread(_call)
    except Exception as exc:  # noqa: BLE001 — degrade gracefully, never fail the job here
        fallback = _mock_analysis(transcript)
        fallback["analysis_error"] = str(exc)
        return fallback
