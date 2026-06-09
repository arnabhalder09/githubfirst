"""Central configuration for the AdSwap backend.

All secrets are read from the environment (see ``adswap/.env``). When a key is
missing the related service automatically falls back to a deterministic mock
implementation so the full pipeline can be exercised end-to-end without any
external credentials.
"""
from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

# Load the .env that lives at the adswap/ project root (one level above backend/).
BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent
load_dotenv(PROJECT_ROOT / ".env")

# ── API keys ────────────────────────────────────────────────────────────────
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "").strip()
HIGGSFIELD_API_KEY = os.getenv("HIGGSFIELD_API_KEY", "").strip()

# Model used for scene analysis.
CLAUDE_MODEL = os.getenv("CLAUDE_MODEL", "claude-sonnet-4-20250514")

# Higgsfield API. Auth is "Key {key}:{secret}"; requests POST to /{model_id}.
HIGGSFIELD_BASE_URL = os.getenv("HIGGSFIELD_BASE_URL", "https://platform.higgsfield.ai").rstrip("/")
HIGGSFIELD_API_SECRET = os.getenv("HIGGSFIELD_API_SECRET", "").strip()
HIGGSFIELD_MODEL_ID = os.getenv("HIGGSFIELD_MODEL_ID", "").strip().strip("/")

# Public base URL of THIS app, so Higgsfield can fetch the uploaded source
# video (e.g. https://adswap.onrender.com). Required for real generation that
# takes an input video by URL.
PUBLIC_BASE_URL = os.getenv("PUBLIC_BASE_URL", "").rstrip("/")

# ── Storage layout (S3-ready folder structure) ───────────────────────────────
# Override STORAGE_ROOT to point at a mounted bucket / different volume.
STORAGE_ROOT = Path(os.getenv("STORAGE_ROOT", PROJECT_ROOT)).resolve()
UPLOAD_DIR = STORAGE_ROOT / "uploads"
OUTPUT_DIR = STORAGE_ROOT / "outputs"
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BACKEND_DIR / 'adswap.db'}")

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ── Misc ──────────────────────────────────────────────────────────────────────
ALLOWED_EXTENSIONS = {".mp4", ".mov", ".avi"}
ALLOWED_VARIATIONS = {3, 5, 10}
ALLOWED_AVATAR_STYLES = {"realistic_female", "realistic_male", "diverse_cast"}

# Whether the services have live credentials.
HAS_OPENAI = bool(OPENAI_API_KEY)
HAS_ANTHROPIC = bool(ANTHROPIC_API_KEY)
HAS_HIGGSFIELD = bool(HIGGSFIELD_API_KEY)
