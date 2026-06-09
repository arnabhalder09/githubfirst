"""SQLAlchemy models for AdSwap job tracking."""
from __future__ import annotations

import enum
from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class JobStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    complete = "complete"
    failed = "failed"


class Job(Base):
    __tablename__ = "jobs"

    id = Column(String, primary_key=True)  # uuid hex
    filename = Column(String, nullable=False)
    video_path = Column(String, nullable=False)
    num_variations = Column(Integer, nullable=False, default=3)
    avatar_style = Column(String, nullable=False, default="diverse_cast")

    status = Column(Enum(JobStatus), nullable=False, default=JobStatus.pending)
    progress = Column(Float, nullable=False, default=0.0)  # 0..100
    stage = Column(String, nullable=False, default="queued")
    error = Column(Text, nullable=True)

    # Pipeline artefacts (stored as JSON text).
    transcript = Column(Text, nullable=True)
    scene_analysis = Column(Text, nullable=True)

    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    variations = relationship(
        "Variation",
        back_populates="job",
        cascade="all, delete-orphan",
        order_by="Variation.index",
    )

    def to_dict(self, include_artifacts: bool = False) -> dict:
        data = {
            "id": self.id,
            "filename": self.filename,
            "num_variations": self.num_variations,
            "avatar_style": self.avatar_style,
            "status": self.status.value if isinstance(self.status, JobStatus) else self.status,
            "progress": round(self.progress, 1),
            "stage": self.stage,
            "error": self.error,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "variations": [v.to_dict() for v in self.variations],
        }
        if include_artifacts:
            import json

            data["transcript"] = json.loads(self.transcript) if self.transcript else None
            data["scene_analysis"] = (
                json.loads(self.scene_analysis) if self.scene_analysis else None
            )
        return data


class Variation(Base):
    __tablename__ = "variations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(String, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    index = Column(Integer, nullable=False)
    label = Column(String, nullable=False)  # e.g. "Variation 1 · realistic female"
    avatar_style = Column(String, nullable=False)

    status = Column(String, nullable=False, default="pending")  # pending|complete|failed
    video_path = Column(String, nullable=True)  # path on disk (relative to OUTPUT_DIR)
    thumbnail_path = Column(String, nullable=True)
    external_job_id = Column(String, nullable=True)  # Higgsfield job id when applicable
    # If real generation failed and we fell back to copying the source, the
    # underlying error is recorded here so the UI can explain what happened.
    note = Column(Text, nullable=True)

    job = relationship("Job", back_populates="variations")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "job_id": self.job_id,
            "index": self.index,
            "label": self.label,
            "avatar_style": self.avatar_style,
            "status": self.status,
            "video_url": f"/files/outputs/{self.video_path}" if self.video_path else None,
            "thumbnail_url": f"/files/outputs/{self.thumbnail_path}"
            if self.thumbnail_path
            else None,
            "external_job_id": self.external_job_id,
            "note": self.note,
        }
