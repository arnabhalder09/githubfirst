"""Core processing pipeline for AdSwap jobs.

Runs as a FastAPI background task. Each stage updates the job's progress/stage
in SQLite so the frontend can poll GET /jobs/{id}/status.
"""
from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path

import config
from claude_service import claude_analyze_scenes
from database import SessionLocal
from higgsfield_service import avatar_for_variation, higgsfield_swap_character
from models import Job, JobStatus, Variation
from storage import job_output_dir, relative_output, relative_upload
from whisper_service import whisper_transcribe

# Progress weights for each stage (sum to 100). Generation is the bulk.
P_AUDIO, P_TRANSCRIBE, P_ANALYZE, P_GENERATE = 5, 15, 15, 65


def _has_ffmpeg() -> bool:
    return shutil.which("ffmpeg") is not None


def extract_audio(video_path: Path) -> Path | None:
    """Extract a wav track via ffmpeg. Returns None if ffmpeg is unavailable."""
    if not _has_ffmpeg():
        return None
    audio_path = video_path.with_suffix(".wav")
    try:
        subprocess.run(
            ["ffmpeg", "-y", "-i", str(video_path), "-vn", "-ac", "1",
             "-ar", "16000", str(audio_path)],
            check=True,
            capture_output=True,
        )
        return audio_path
    except subprocess.CalledProcessError:
        return None


def extract_frames(video_path: Path, out_dir: Path, count: int = 4) -> list[Path]:
    """Sample `count` frames evenly via ffmpeg. Returns [] if unavailable."""
    if not _has_ffmpeg():
        return []
    out_dir.mkdir(parents=True, exist_ok=True)
    try:
        subprocess.run(
            ["ffmpeg", "-y", "-i", str(video_path),
             "-vf", f"fps=1/2,scale=512:-1", "-frames:v", str(count),
             str(out_dir / "frame_%02d.jpg")],
            check=True,
            capture_output=True,
        )
        return sorted(out_dir.glob("frame_*.jpg"))
    except subprocess.CalledProcessError:
        return []


def _update(db, job: Job, *, progress=None, stage=None, status=None) -> None:
    if progress is not None:
        job.progress = progress
    if stage is not None:
        job.stage = stage
    if status is not None:
        job.status = status
    db.commit()


async def process_job(job_id: str) -> None:
    """Entry point invoked as a background task."""
    db = SessionLocal()
    try:
        job = db.get(Job, job_id)
        if job is None:
            return
        video_path = Path(job.video_path)
        out_dir = job_output_dir(job_id)

        _update(db, job, status=JobStatus.processing, stage="extracting_audio", progress=0)

        # Step 1: extract audio (best-effort).
        audio_path = extract_audio(video_path)
        _update(db, job, progress=P_AUDIO, stage="transcribing")

        # Step 2: transcribe.
        transcript = await whisper_transcribe(audio_path or video_path)
        job.transcript = json.dumps(transcript)
        _update(db, job, progress=P_AUDIO + P_TRANSCRIBE, stage="analyzing_scenes")

        # Step 3: analyze scenes with Claude (frames optional).
        frames = extract_frames(video_path, out_dir / "_frames")
        scene_analysis = await claude_analyze_scenes(transcript, frames)

        # If the user uploaded a product photo, seed generation from it so the
        # exact product appears. Requires PUBLIC_BASE_URL so Higgsfield can fetch it.
        product_image_url = None
        if config.PUBLIC_BASE_URL and job.product_image_path:
            rel = relative_upload(job.product_image_path).replace("\\", "/")
            product_image_url = f"{config.PUBLIC_BASE_URL}/files/uploads/{rel}"
        job.scene_analysis = json.dumps(scene_analysis)
        _update(db, job, progress=P_AUDIO + P_TRANSCRIBE + P_ANALYZE, stage="generating")

        # Pre-create variation rows so the dashboard shows them as pending.
        n = job.num_variations
        variations: list[Variation] = []
        for i in range(n):
            v = Variation(
                job_id=job_id,
                index=i,
                label=f"Variation {i + 1} · {avatar_for_variation(job.avatar_style, i)}",
                avatar_style=job.avatar_style,
                status="pending",
                stage="queued",
            )
            db.add(v)
            variations.append(v)
        db.commit()

        base_progress = P_AUDIO + P_TRANSCRIBE + P_ANALYZE

        # Step 4: generate each variation.
        for i, v in enumerate(variations):
            def _on_stage(stage: str, _v=v) -> None:
                _v.stage = stage
                db.commit()

            result = await higgsfield_swap_character(
                video_path=video_path,
                transcript=transcript,
                avatar_style=job.avatar_style,
                variation_index=i,
                output_dir=out_dir,
                on_stage=_on_stage,
                scene_analysis=scene_analysis,
                product_image_url=product_image_url,
            )
            v.stage = "done"
            v.status = result.get("status", "complete")
            v.external_job_id = result.get("external_job_id")
            # Surface a fallback/error note: real generation failed (copied
            # source instead), or we're running in mock mode.
            if result.get("generation_error"):
                v.note = f"Generation fell back to source copy: {result['generation_error']}"
            elif result.get("mock"):
                v.note = "Mock mode — output is a copy of the source (no API key set)."
            if result.get("video_filename"):
                v.video_path = relative_output(out_dir / result["video_filename"])
            if result.get("thumbnail_filename"):
                v.thumbnail_path = relative_output(out_dir / result["thumbnail_filename"])
            db.commit()
            _update(db, job, progress=base_progress + P_GENERATE * (i + 1) / n)

        # Step 5/6: finalize.
        _update(db, job, status=JobStatus.complete, stage="complete", progress=100)
    except Exception as exc:  # noqa: BLE001 — record failure on the job
        db.rollback()
        job = db.get(Job, job_id)
        if job is not None:
            job.status = JobStatus.failed
            job.error = str(exc)
            job.stage = "failed"
            db.commit()
    finally:
        db.close()
