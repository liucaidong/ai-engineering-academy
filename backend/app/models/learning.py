"""Tenant- and learner-owned progress and assessment records."""
from datetime import datetime
from decimal import Decimal
from typing import Any
from uuid import UUID, uuid4

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    ForeignKeyConstraint,
    Index,
    Integer,
    Numeric,
    String,
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class LearningProgress(Base):
    __tablename__ = "learning_progress"
    __table_args__ = (
        ForeignKeyConstraint(
            ["tenant_id", "user_id"],
            ["tenant_memberships.tenant_id", "tenant_memberships.user_id"],
            ondelete="CASCADE",
        ),
        ForeignKeyConstraint(
            ["course_release_id"],
            ["course_releases.id"],
            ondelete="RESTRICT",
        ),
        UniqueConstraint(
            "tenant_id",
            "user_id",
            "course_release_id",
            "module_key",
            name="uq_learning_progress_learner_release_module",
        ),
        CheckConstraint(
            "completion_status IN ('in_progress', 'completed')",
            name="completion_status_valid",
        ),
        CheckConstraint(
            "(completion_status = 'completed' AND completed_at IS NOT NULL) OR "
            "(completion_status = 'in_progress' AND completed_at IS NULL)",
            name="completion_timestamp_matches_status",
        ),
        Index(
            "ix_learning_progress_tenant_user_release",
            "tenant_id",
            "user_id",
            "course_release_id",
        ),
    )

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    tenant_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), nullable=False)
    user_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), nullable=False)
    course_release_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), nullable=False)
    module_key: Mapped[str] = mapped_column(String(80), nullable=False)
    completion_status: Mapped[str] = mapped_column(
        String(16), nullable=False, default="in_progress", server_default="in_progress"
    )
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    last_accessed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )


class AssessmentResult(Base):
    __tablename__ = "assessment_results"
    __table_args__ = (
        ForeignKeyConstraint(
            ["tenant_id", "user_id"],
            ["tenant_memberships.tenant_id", "tenant_memberships.user_id"],
            ondelete="CASCADE",
        ),
        ForeignKeyConstraint(
            ["course_release_id"],
            ["course_releases.id"],
            ondelete="RESTRICT",
        ),
        ForeignKeyConstraint(
            ["tenant_id", "graded_by_user_id"],
            ["tenant_memberships.tenant_id", "tenant_memberships.user_id"],
            ondelete="RESTRICT",
        ),
        UniqueConstraint(
            "tenant_id",
            "user_id",
            "course_release_id",
            "assessment_key",
            "attempt_number",
            name="uq_assessment_results_learner_attempt",
        ),
        CheckConstraint("attempt_number > 0", name="attempt_number_positive"),
        CheckConstraint(
            "grading_mode IN ('self_review', 'automated', 'instructor')",
            name="grading_mode_valid",
        ),
        CheckConstraint(
            "status IN ('draft', 'submitted', 'graded')",
            name="status_valid",
        ),
        CheckConstraint(
            "score IS NULL OR (score >= 0 AND score <= 100)",
            name="score_in_range",
        ),
        CheckConstraint(
            "(status = 'graded' AND score IS NOT NULL AND graded_at IS NOT NULL "
            "AND ((grading_mode = 'instructor' AND graded_by_user_id IS NOT NULL) "
            "OR (grading_mode IN ('self_review', 'automated') AND graded_by_user_id IS NULL))) "
            "OR (status <> 'graded' AND score IS NULL AND graded_at IS NULL "
            "AND graded_by_user_id IS NULL)",
            name="grading_fields_match_status",
        ),
        Index(
            "ix_assessment_results_tenant_user_release",
            "tenant_id",
            "user_id",
            "course_release_id",
        ),
    )

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    tenant_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), nullable=False)
    user_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), nullable=False)
    course_release_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), nullable=False)
    assessment_key: Mapped[str] = mapped_column(String(120), nullable=False)
    attempt_number: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    status: Mapped[str] = mapped_column(
        String(16), nullable=False, default="draft", server_default="draft"
    )
    grading_mode: Mapped[str] = mapped_column(String(16), nullable=False)
    response: Mapped[dict[str, Any]] = mapped_column(
        JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb")
    )
    rubric_self_review: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    score: Mapped[Decimal | None] = mapped_column(Numeric(6, 3))
    feedback: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    graded_by_user_id: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True))
    graded_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
