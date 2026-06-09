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

## Run it

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
