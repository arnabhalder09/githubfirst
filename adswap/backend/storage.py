"""Filesystem storage helpers.

The layout mirrors what an S3 bucket would look like so the implementation can
later be swapped for boto3 without touching callers:

    uploads/{job_id}/{original_filename}
    outputs/{job_id}/variation_{i}.mp4
    outputs/{job_id}/variation_{i}.jpg   (thumbnail)
"""
from __future__ import annotations

import io
import shutil
import zipfile
from pathlib import Path

from config import OUTPUT_DIR, UPLOAD_DIR


def upload_path(job_id: str, filename: str) -> Path:
    d = UPLOAD_DIR / job_id
    d.mkdir(parents=True, exist_ok=True)
    return d / filename


def job_output_dir(job_id: str) -> Path:
    d = OUTPUT_DIR / job_id
    d.mkdir(parents=True, exist_ok=True)
    return d


def relative_output(path: Path) -> str:
    """Return the path relative to OUTPUT_DIR (used to build public URLs)."""
    return str(Path(path).resolve().relative_to(OUTPUT_DIR.resolve()))


def relative_upload(path: Path) -> str:
    """Return the path relative to UPLOAD_DIR (used to build public URLs)."""
    return str(Path(path).resolve().relative_to(UPLOAD_DIR.resolve()))


def save_upload(job_id: str, filename: str, fileobj) -> Path:
    dest = upload_path(job_id, filename)
    with dest.open("wb") as out:
        shutil.copyfileobj(fileobj, out)
    return dest


def build_zip(job_id: str) -> io.BytesIO:
    """Zip every output file for a job into an in-memory archive."""
    out_dir = job_output_dir(job_id)
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for f in sorted(out_dir.glob("*")):
            if f.is_file():
                zf.write(f, arcname=f.name)
    buf.seek(0)
    return buf
