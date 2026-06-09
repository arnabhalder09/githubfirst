# AdSwap

Take a UGC video ad, analyze it with AI, and produce multiple character-swapped
variations that keep the same script and product.

```
upload → extract audio → transcribe (Whisper) → analyze scenes (Claude)
       → swap characters per variation (Higgsfield) → store + track in SQLite
```

## Stack

| Layer            | Tech                                             |
| ---------------- | ------------------------------------------------ |
| Frontend         | React + Vite + TailwindCSS (dark SaaS UI)        |
| Backend          | Python FastAPI                                   |
| Transcription    | OpenAI Whisper API                               |
| Scene analysis   | Anthropic Claude (`claude-sonnet-4-20250514`)    |
| Character swap   | Higgsfield AI API                                |
| Storage          | Local filesystem (S3-ready layout)               |
| Job tracking     | SQLite via SQLAlchemy                            |

> **No API keys? It still runs.** Any missing key makes that service fall back to
> a deterministic mock, so you can exercise the whole pipeline (upload → variations
> → download) end-to-end. `ffmpeg` is used for audio/frame extraction when present
> and is skipped gracefully when not installed.

## Layout

```
adswap/
├── backend/            # FastAPI app
│   ├── main.py             # routes
│   ├── pipeline.py         # core processing logic
│   ├── whisper_service.py  # transcription
│   ├── claude_service.py   # scene analysis
│   ├── higgsfield_service.py
│   ├── models.py           # SQLAlchemy models
│   ├── database.py
│   ├── storage.py
│   └── config.py
├── frontend/           # React app (Upload / Dashboard / Results)
├── uploads/            # raw uploaded videos
├── outputs/            # processed variations (outputs/{job_id}/)
├── requirements.txt
└── .env.example
```

## Deploy to the web (Render, no laptop needed)

The repo ships a `render.yaml` blueprint that deploys AdSwap as a **single
Docker web service** (FastAPI serves the API *and* the built React frontend on
one URL). From a phone:

1. Go to **https://render.com** and sign in with GitHub.
2. **New → Blueprint**, pick this repo, **Apply**.
3. Render builds the image and gives you a public `https://…onrender.com` URL.

API keys are optional — leave them blank for mock mode, or paste them into the
Render dashboard to enable real generation. (Free plan has an ephemeral
filesystem, so generated media resets on redeploy; see the note in
`render.yaml` for adding a persistent disk.)

The same single-container image runs anywhere:

```bash
cd adswap
docker build -t adswap .
docker run -p 8000:8000 adswap   # open http://localhost:8000
```

## Run with Docker Compose

Two containers — a FastAPI backend and an nginx-served frontend that reverse-
proxies the API. `ffmpeg` is baked into the backend image, and uploads/outputs/
SQLite persist on a named volume.

```bash
cd adswap
cp .env.example .env          # optional — add API keys, or leave blank for mock mode
docker compose up --build
```

Then open **http://localhost:8080**. That's the only port exposed; the frontend
proxies `/jobs`, `/files`, `/health`, and `/docs` to the backend internally, so
the app works same-origin with no extra config.

Stop with `docker compose down` (add `-v` to also wipe the data volume).

## Run locally (without Docker)

### 1. Backend

```bash
cd adswap
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # optional: add real API keys

cd backend
uvicorn main:app --reload --port 8000
```

Backend serves the API on `http://localhost:8000` (docs at `/docs`) and media
under `/files/...`.

### 2. Frontend

```bash
cd adswap/frontend
npm install
npm run dev                   # http://localhost:5173 (proxies API to :8000)
```

## API

| Method | Path                    | Purpose                                  |
| ------ | ----------------------- | ---------------------------------------- |
| POST   | `/jobs`                 | Upload video + options, start pipeline   |
| GET    | `/jobs`                 | List all jobs (dashboard)                |
| GET    | `/jobs/{id}`            | Full job detail + variations             |
| GET    | `/jobs/{id}/status`     | Lightweight progress poll (% complete)   |
| POST   | `/jobs/{id}/remix`      | Re-run source video with a new avatar    |
| GET    | `/jobs/{id}/download`   | Zip of all output variations             |
| GET    | `/health`               | Service + credential status              |

`POST /jobs` form fields: `file` (mp4/mov/avi), `num_variations` (3/5/10),
`avatar_style` (`realistic_female` / `realistic_male` / `diverse_cast`).

The frontend polls `/jobs/{id}/status` every 3 seconds.

## S3-readiness

`storage.py` centralizes all path logic with an `uploads/{job_id}/` and
`outputs/{job_id}/` layout that maps directly to bucket prefixes. Point
`STORAGE_ROOT` at a mounted bucket, or swap the helpers for `boto3` calls
without touching the pipeline.
