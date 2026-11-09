"""Add learner progress and assessment records with forced RLS.

Revision ID: 0005_learner_records
Revises: 0004_tenant_rls
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0005_learner_records"
down_revision: str | None = "0004_tenant_rls"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

_USER = "NULLIF(current_setting('app.user_id', true), '')::uuid"
_TENANT = "NULLIF(current_setting('app.tenant_id', true), '')::uuid"


def upgrade() -> None:
    op.create_table(
        "learning_progress",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("course_release_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("module_key", sa.String(length=80), nullable=False),
        sa.Column(
            "completion_status",
            sa.String(length=16),
            server_default="in_progress",
            nullable=False,
        ),
        sa.Column(
            "started_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "last_accessed_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "length(trim(module_key)) > 0",
            name="ck_learning_progress_module_key_non_empty",
        ),
        sa.CheckConstraint(
            "completion_status IN ('in_progress', 'completed')",
            name="ck_learning_progress_completion_status_valid",
        ),
        sa.CheckConstraint(
            "(completion_status = 'completed' AND completed_at IS NOT NULL) OR "
            "(completion_status = 'in_progress' AND completed_at IS NULL)",
            name="ck_learning_progress_completion_timestamp_matches_status",
        ),
        sa.ForeignKeyConstraint(
            ["tenant_id", "user_id"],
            ["tenant_memberships.tenant_id", "tenant_memberships.user_id"],
            name="fk_learning_progress_tenant_id_tenant_memberships",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["course_release_id"],
            ["course_releases.id"],
            name="fk_learning_progress_course_release_id_course_releases",
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_learning_progress"),
        sa.UniqueConstraint(
            "tenant_id",
            "user_id",
            "course_release_id",
            "module_key",
            name="uq_learning_progress_learner_release_module",
        ),
    )
    op.create_index(
        "ix_learning_progress_tenant_user_release",
        "learning_progress",
        ["tenant_id", "user_id", "course_release_id"],
        unique=False,
    )

    op.create_table(
        "assessment_results",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("course_release_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("assessment_key", sa.String(length=120), nullable=False),
        sa.Column("attempt_number", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=16), server_default="draft", nullable=False),
        sa.Column("grading_mode", sa.String(length=16), nullable=False),
        sa.Column(
            "response",
            postgresql.JSONB(astext_type=sa.Text()),
            server_default=sa.text("'{}'::jsonb"),
            nullable=False,
        ),
        sa.Column("rubric_self_review", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("score", sa.Numeric(precision=6, scale=3), nullable=True),
        sa.Column("feedback", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("graded_by_user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("graded_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "length(trim(assessment_key)) > 0",
            name="ck_assessment_results_assessment_key_non_empty",
        ),
        sa.CheckConstraint(
            "attempt_number > 0",
            name="ck_assessment_results_attempt_number_positive",
        ),
        sa.CheckConstraint(
            "grading_mode IN ('self_review', 'automated', 'instructor')",
            name="ck_assessment_results_grading_mode_valid",
        ),
        sa.CheckConstraint(
            "status IN ('draft', 'submitted', 'graded')",
            name="ck_assessment_results_status_valid",
        ),
        sa.CheckConstraint(
            "score IS NULL OR (score >= 0 AND score <= 100)",
            name="ck_assessment_results_score_in_range",
        ),
        sa.CheckConstraint(
            "(status = 'draft' AND submitted_at IS NULL) OR "
            "(status IN ('submitted', 'graded') AND submitted_at IS NOT NULL)",
            name="ck_assessment_results_submission_timestamp_matches_status",
        ),
        sa.CheckConstraint(
            "(status = 'graded' AND score IS NOT NULL AND graded_at IS NOT NULL "
            "AND ((grading_mode = 'instructor' AND graded_by_user_id IS NOT NULL) "
            "OR (grading_mode IN ('self_review', 'automated') AND graded_by_user_id IS NULL))) "
            "OR (status <> 'graded' AND score IS NULL AND graded_at IS NULL "
            "AND graded_by_user_id IS NULL)",
            name="ck_assessment_results_grading_fields_match_status",
        ),
        sa.ForeignKeyConstraint(
            ["tenant_id", "user_id"],
            ["tenant_memberships.tenant_id", "tenant_memberships.user_id"],
            name="fk_assessment_results_learner_membership",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["course_release_id"],
            ["course_releases.id"],
            name="fk_assessment_results_course_release_id_course_releases",
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["tenant_id", "graded_by_user_id"],
            ["tenant_memberships.tenant_id", "tenant_memberships.user_id"],
            name="fk_assessment_results_grader_membership",
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_assessment_results"),
        sa.UniqueConstraint(
            "tenant_id",
            "user_id",
            "course_release_id",
            "assessment_key",
            "attempt_number",
            name="uq_assessment_results_learner_attempt",
        ),
    )
    op.create_index(
        "ix_assessment_results_tenant_user_release",
        "assessment_results",
        ["tenant_id", "user_id", "course_release_id"],
        unique=False,
    )

    for table in ("learning_progress", "assessment_results"):
        op.execute(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY")
        op.execute(f"ALTER TABLE {table} FORCE ROW LEVEL SECURITY")

    for table in ("learning_progress", "assessment_results"):
        scope = (
            f"tenant_id = {_TENANT} AND user_id = {_USER} AND EXISTS ("
            f"SELECT 1 FROM tenant_memberships m "
            f"WHERE m.tenant_id = {table}.tenant_id "
            f"AND m.user_id = {table}.user_id AND m.status = 'active')"
        )
        op.execute(f"CREATE POLICY {table}_self_select ON {table} FOR SELECT USING ({scope})")
        op.execute(f"CREATE POLICY {table}_self_insert ON {table} FOR INSERT WITH CHECK ({scope})")
        op.execute(
            f"CREATE POLICY {table}_self_update ON {table} "
            f"FOR UPDATE USING ({scope}) WITH CHECK ({scope})"
        )


def downgrade() -> None:
    for table in ("learning_progress", "assessment_results"):
        for action in ("select", "insert", "update"):
            op.execute(f"DROP POLICY IF EXISTS {table}_self_{action} ON {table}")
        op.execute(f"ALTER TABLE {table} NO FORCE ROW LEVEL SECURITY")
        op.execute(f"ALTER TABLE {table} DISABLE ROW LEVEL SECURITY")

    op.drop_index(
        "ix_assessment_results_tenant_user_release",
        table_name="assessment_results",
    )
    op.drop_table("assessment_results")
    op.drop_index(
        "ix_learning_progress_tenant_user_release",
        table_name="learning_progress",
    )
    op.drop_table("learning_progress")
