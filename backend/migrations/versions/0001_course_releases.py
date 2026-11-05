"""Create versioned course release snapshots.

Revision ID: 0001_course_releases
Revises:
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0001_course_releases"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "course_releases",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("course_key", sa.String(length=80), nullable=False),
        sa.Column("version", sa.String(length=32), nullable=False),
        sa.Column("schema_version", sa.Integer(), nullable=False),
        sa.Column("content_sha256", sa.String(length=64), nullable=False),
        sa.Column("content", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("status", sa.String(length=16), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("schema_version > 0", name="ck_course_releases_schema_version_positive"),
        sa.CheckConstraint("status IN ('draft', 'published', 'retired')", name="ck_course_releases_status_valid"),
        sa.PrimaryKeyConstraint("id", name="pk_course_releases"),
        sa.UniqueConstraint("course_key", "version", name="uq_course_releases_course_version"),
    )
    op.create_index(
        "ix_course_releases_course_status",
        "course_releases",
        ["course_key", "status"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_course_releases_course_status", table_name="course_releases")
    op.drop_table("course_releases")
