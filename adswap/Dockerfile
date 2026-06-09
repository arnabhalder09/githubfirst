# Single-container deploy: build the React frontend, then run FastAPI (with
# ffmpeg) serving both the API and the static frontend on one port. This is the
# image used for one-click web hosting (e.g. Render). Build context: adswap/.

# 1. Build the Vite frontend.
FROM node:22-alpine AS frontend
WORKDIR /fe
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# 2. Python backend + ffmpeg, serving the built frontend.
FROM python:3.11-slim
RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./backend/
COPY --from=frontend /fe/dist ./frontend_dist

ENV STORAGE_ROOT=/data \
    DATABASE_URL=sqlite:////data/adswap.db \
    FRONTEND_DIST=/app/frontend_dist \
    PYTHONUNBUFFERED=1
RUN mkdir -p /data

WORKDIR /app/backend
# Hosts like Render inject $PORT; default to 8000 locally.
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
