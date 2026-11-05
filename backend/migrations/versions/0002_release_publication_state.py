"""Require publication timestamps to match release lifecycle state.

Revision ID: 0002_release_publication_state
Revises: 0001_course_releases
"""
from typing import Sequence, Union

from alembic import op

revision: str = "0002_release_publication_state"
down_revision: Union[str, None] = "0001_course_releases"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_check_constraint(
        "ck_course_releases_publication_timestamp_matches_status",
        "course_releases",
        "((status = 'draft' AND published_at IS NULL) OR "
        "(status IN ('published', 'retired') AND published_at IS NOT NULL))",
    )


def downgrade() -> None:
    op.drop_constraint(
        "ck_course_releases_publication_timestamp_matches_status",
        "course_releases",
        type_="check",
    )
