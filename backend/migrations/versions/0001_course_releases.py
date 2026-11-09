"""Create versioned course release snapshots.

Revision ID: 0001_course_releases
Revises:
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001_course_releases"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "course_releases",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("course_key", sa.String(length=80), nullable=False),
        sa.Column("version", sa.String(length=32), nullable=False),
        sa.Column("schema_version", sa.Integer(), nullable=False),
        sa.Column("content_sha256", sa.String(length=64), nullable=False),
        sa.Column("content", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("status", sa.String(length=16), server_default="draft", nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("schema_version > 0", name="ck_course_releases_schema_version_positive"),
        sa.CheckConstraint(
            "status IN ('draft', 'published', 'retired')", name="ck_course_releases_status_valid"
        ),
        sa.CheckConstraint(
            "content_sha256 ~ '^[0-9a-f]{64}$'", name="ck_course_releases_content_sha256_hex"
        ),
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
