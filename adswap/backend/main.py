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

import os
import uuid
from pathlib import Path

from fastapi import BackgroundTasks, Depends, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
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


def _save_product_image(job_id: str, product_image: UploadFile | None) -> str | None:
    """Validate + save an optional product image, returning its path on disk."""
    if product_image is None or not product_image.filename:
        return None
    ext = Path(product_image.filename).suffix.lower()
    if ext not in config.ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            400,
            f"Unsupported product image type {ext!r}; allowed: {sorted(config.ALLOWED_IMAGE_EXTENSIONS)}",
        )
    dest = storage.save_upload(job_id, f"product_{product_image.filename}", product_image.file)
    return str(dest)


@app.post("/jobs", status_code=201)
async def create_job(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    num_variations: int = Form(3),
    avatar_style: str = Form("diverse_cast"),
    product_image: UploadFile | None = File(None),
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
    product_image_path = _save_product_image(job_id, product_image)

    job = Job(
        id=job_id,
        filename=file.filename,
        video_path=str(dest),
        num_variations=num_variations,
        avatar_style=style,
        product_image_path=product_image_path,
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
    return _get_job_or_404(db, job_id).to_dict(include_artifacts=True)


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
    product_image: UploadFile | None = File(None),
    db: Session = Depends(get_session),
) -> dict:
    src = _get_job_or_404(db, job_id)
    style = _normalize_avatar_style(avatar_style)
    n = num_variations or src.num_variations
    if n not in config.ALLOWED_VARIATIONS:
        raise HTTPException(400, f"num_variations must be one of {sorted(config.ALLOWED_VARIATIONS)}")

    new_id = uuid.uuid4().hex
    # Reuse the source video; use a new product image if provided, else the source's.
    new_product = _save_product_image(new_id, product_image) or src.product_image_path
    new_job = Job(
        id=new_id,
        filename=src.filename,
        video_path=src.video_path,
        num_variations=n,
        avatar_style=style,
        product_image_path=new_product,
        status=JobStatus.pending,
        stage="queued",
        progress=0.0,
    )
    db.add(new_job)
    db.commit()
    background_tasks.add_task(process_job, new_id)
    return {"job_id": new_id, "remixed_from": job_id, "status": new_job.status.value}


@app.get("/debug/higgsfield")
async def debug_higgsfield() -> dict:
    """Credentials + auth diagnostic (never returns secret values).

    Does a credit-free authenticated probe: a 404 means auth is accepted (the
    random request id just doesn't exist); a 401/403 means the key/secret are
    wrong; a 500 points at an account/server issue.
    """
    import httpx

    from higgsfield_service import _auth_header

    info: dict = {
        "has_key": bool(config.HIGGSFIELD_API_KEY),
        "key_length": len(config.HIGGSFIELD_API_KEY),
        "key_contains_colon": ":" in config.HIGGSFIELD_API_KEY,
        "has_secret": bool(config.HIGGSFIELD_API_SECRET),
        "secret_length": len(config.HIGGSFIELD_API_SECRET),
        "base_url": config.HIGGSFIELD_BASE_URL,
        "image_model": config.HIGGSFIELD_IMAGE_MODEL_ID,
        "video_model": config.HIGGSFIELD_MODEL_ID,
        "product_model": config.HIGGSFIELD_PRODUCT_MODEL_ID or None,
        "public_base_url": config.PUBLIC_BASE_URL or None,
        "product_preservation_active": bool(
            config.HIGGSFIELD_PRODUCT_MODEL_ID and config.PUBLIC_BASE_URL
        ),
    }
    probe = f"{config.HIGGSFIELD_BASE_URL}/requests/00000000-0000-0000-0000-000000000000/status"
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.get(
                probe, headers={"Authorization": _auth_header(), "Accept": "application/json"}
            )
        info["auth_probe_status"] = r.status_code
        info["auth_probe_body"] = r.text[:300]
    except Exception as exc:  # noqa: BLE001
        info["auth_probe_error"] = str(exc)
    return info


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


# ── Optionally serve the built React frontend from the same origin ────────────
# When FRONTEND_DIST points at a Vite build (set in the single-container /
# Render deployment), serve its assets and fall back to index.html for client-
# side routes. Skipped entirely in local dev, where Vite serves the frontend.
_FRONTEND_DIST = Path(os.getenv("FRONTEND_DIST", "")).expanduser()
if _FRONTEND_DIST.is_dir():
    _assets = _FRONTEND_DIST / "assets"
    if _assets.is_dir():
        app.mount("/assets", StaticFiles(directory=str(_assets)), name="assets")

    @app.get("/{full_path:path}")
    def spa_fallback(full_path: str) -> FileResponse:
        # API routes and the /files, /assets mounts are registered earlier, so
        # they match first; this only catches unmatched (SPA) paths.
        candidate = _FRONTEND_DIST / full_path
        if full_path and candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(_FRONTEND_DIST / "index.html")
