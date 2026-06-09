# Backend image. Build context is the adswap/ project root so we can grab
# requirements.txt (which lives one level above backend/).
FROM python:3.11-slim

# ffmpeg enables real audio/frame extraction; the app degrades gracefully
# without it, but the image is the right place to guarantee it's present.
RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./backend/

# Persist uploads, outputs, and the SQLite DB on a mounted volume.
ENV STORAGE_ROOT=/data \
    DATABASE_URL=sqlite:////data/adswap.db \
    PYTHONUNBUFFERED=1
RUN mkdir -p /data

WORKDIR /app/backend
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
