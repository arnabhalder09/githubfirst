"""Audio transcription via the OpenAI Whisper API.

Returns a transcript dict::

    {"text": "...", "segments": [{"start": 0.0, "end": 3.2, "text": "..."}, ...]}

Falls back to a deterministic mock transcript when OPENAI_API_KEY is absent so
the pipeline can run without credentials.
"""
from __future__ import annotations

import asyncio
from pathlib import Path

import config


def _mock_transcript() -> dict:
    segments = [
        {"start": 0.0, "end": 2.4, "text": "Okay so I've been using this for two weeks now."},
        {"start": 2.4, "end": 5.8, "text": "And honestly it completely changed my morning routine."},
        {"start": 5.8, "end": 9.1, "text": "Look how easy it is — one press and you're done."},
        {"start": 9.1, "end": 12.6, "text": "The build quality feels way more premium than the price."},
        {"start": 12.6, "end": 16.0, "text": "Tap the link in my bio to get 20% off your first order."},
    ]
    return {
        "text": " ".join(s["text"] for s in segments),
        "segments": segments,
        "language": "en",
        "mock": True,
    }


async def whisper_transcribe(audio_path: str | Path) -> dict:
    audio_path = Path(audio_path)

    if not config.HAS_OPENAI or not audio_path.exists():
        # No key (or no extractable audio): return a representative mock.
        await asyncio.sleep(0.2)
        return _mock_transcript()

    # Real call — run the blocking SDK call in a thread.
    def _call() -> dict:
        from openai import OpenAI

        client = OpenAI(api_key=config.OPENAI_API_KEY)
        with audio_path.open("rb") as fh:
            resp = client.audio.transcriptions.create(
                model="whisper-1",
                file=fh,
                response_format="verbose_json",
                timestamp_granularities=["segment"],
            )
        data = resp.model_dump() if hasattr(resp, "model_dump") else dict(resp)
        segments = [
            {"start": s.get("start"), "end": s.get("end"), "text": s.get("text", "").strip()}
            for s in (data.get("segments") or [])
        ]
        return {
            "text": data.get("text", "").strip(),
            "segments": segments,
            "language": data.get("language"),
            "mock": False,
        }

    return await asyncio.to_thread(_call)
