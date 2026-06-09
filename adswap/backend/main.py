"""AdSwap FastAPI application.

Endpoints
    POST   /jobs                  upload a video + options, start the pipeline
    GET    /jobs                  list all jobs (dashboard)
    GET    /jobs/{id}             full job detail incl. variations
    GET    /jobs/{id}/status      lightweight progress poll (% complete)
    POST   /jobs/{id}/remix       re-run a finished job with a new avatar style
    GET    /jobs/{id}/download    zip of all output variations
    GET    /files/...             static serving of uploads/outputs
    GET    /health                service + credential status
"""
from __future__ import annotations

import uuid
from pathlib import Path

from fastapi import BackgroundTasks, Depends, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select
from sqlalchemy.orm import Session

import config
import storage
from database import get_session, init_db
from models import Job, JobStatus
from pipeline import process_job

app = FastAPI(title="AdSwap API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # dev convenience; tighten for production
    allow_methods=["*"],
    allow_headers=["*"],
)


# Initialize the schema and mount media dirs at import time so the app works
# under uvicorn, TestClient, or any ASGI server regardless of lifespan handling.
# config.py guarantees the directories already exist.
init_db()
app.mount("/files/outputs", StaticFiles(directory=str(config.OUTPUT_DIR)), name="outputs")
app.mount("/files/uploads", StaticFiles(directory=str(config.UPLOAD_DIR)), name="uploads")


def _normalize_avatar_style(value: str) -> str:
    v = (value or "").strip().lower().replace(" ", "_").replace("-", "_")
    if v not in config.ALLOWED_AVATAR_STYLES:
        raise HTTPException(400, f"avatar_style must be one of {sorted(config.ALLOWED_AVATAR_STYLES)}")
    return v


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "services": {
            "openai_whisper": config.HAS_OPENAI,
            "anthropic_claude": config.HAS_ANTHROPIC,
            "higgsfield": config.HAS_HIGGSFIELD,
        },
        "mock_mode": not (config.HAS_OPENAI and config.HAS_ANTHROPIC and config.HAS_HIGGSFIELD),
    }


@app.post("/jobs", status_code=201)
async def create_job(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    num_variations: int = Form(3),
    avatar_style: str = Form("diverse_cast"),
    db: Session = Depends(get_session),
) -> dict:
    ext = Path(file.filename or "").suffix.lower()
    if ext not in config.ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"Unsupported file type {ext!r}; allowed: {sorted(config.ALLOWED_EXTENSIONS)}")
    if num_variations not in config.ALLOWED_VARIATIONS:
        raise HTTPException(400, f"num_variations must be one of {sorted(config.ALLOWED_VARIATIONS)}")
    style = _normalize_avatar_style(avatar_style)

    job_id = uuid.uuid4().hex
    dest = storage.save_upload(job_id, file.filename, file.file)

    job = Job(
        id=job_id,
        filename=file.filename,
        video_path=str(dest),
        num_variations=num_variations,
        avatar_style=style,
        status=JobStatus.pending,
        stage="queued",
        progress=0.0,
    )
    db.add(job)
    db.commit()

    background_tasks.add_task(process_job, job_id)
    return {"job_id": job_id, "status": job.status.value}


@app.get("/jobs")
def list_jobs(db: Session = Depends(get_session)) -> list[dict]:
    jobs = db.execute(select(Job).order_by(Job.created_at.desc())).scalars().all()
    return [j.to_dict() for j in jobs]


def _get_job_or_404(db: Session, job_id: str) -> Job:
    job = db.get(Job, job_id)
    if job is None:
        raise HTTPException(404, "Job not found")
    return job


@app.get("/jobs/{job_id}")
def get_job(job_id: str, db: Session = Depends(get_session)) -> dict:
    return _get_job_or_404(db, job_id).to_dict()


@app.get("/jobs/{job_id}/status")
def job_status(job_id: str, db: Session = Depends(get_session)) -> dict:
    job = _get_job_or_404(db, job_id)
    return {
        "job_id": job.id,
        "status": job.status.value,
        "stage": job.stage,
        "progress": round(job.progress, 1),
        "error": job.error,
    }


@app.post("/jobs/{job_id}/remix", status_code=201)
async def remix_job(
    job_id: str,
    background_tasks: BackgroundTasks,
    avatar_style: str = Form(...),
    num_variations: int | None = Form(None),
    db: Session = Depends(get_session),
) -> dict:
    src = _get_job_or_404(db, job_id)
    style = _normalize_avatar_style(avatar_style)
    n = num_variations or src.num_variations
    if n not in config.ALLOWED_VARIATIONS:
        raise HTTPException(400, f"num_variations must be one of {sorted(config.ALLOWED_VARIATIONS)}")

    new_id = uuid.uuid4().hex
    # Reuse the already-uploaded source video.
    new_job = Job(
        id=new_id,
        filename=src.filename,
        video_path=src.video_path,
        num_variations=n,
        avatar_style=style,
        status=JobStatus.pending,
        stage="queued",
        progress=0.0,
    )
    db.add(new_job)
    db.commit()
    background_tasks.add_task(process_job, new_id)
    return {"job_id": new_id, "remixed_from": job_id, "status": new_job.status.value}


@app.get("/jobs/{job_id}/download")
def download_all(job_id: str, db: Session = Depends(get_session)) -> StreamingResponse:
    job = _get_job_or_404(db, job_id)
    if job.status != JobStatus.complete:
        raise HTTPException(409, "Job is not complete yet")
    buf = storage.build_zip(job_id)
    return StreamingResponse(
        buf,
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="adswap_{job_id}.zip"'},
    )
