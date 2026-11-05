"""Allow authenticated users to discover only their own active tenant memberships.

Revision ID: 0010_tenant_membership_discovery
Revises: 0009_assessment_self_grading_guard
"""
from typing import Sequence, Union
from alembic import op

revision: str = "0010_tenant_membership_discovery"
down_revision: Union[str, None] = "0009_assessment_self_grading_guard"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        "CREATE POLICY tenant_memberships_self_discovery ON tenant_memberships "
        "FOR SELECT USING (user_id = NULLIF(current_setting('app.user_id', true), '')::uuid "
        "AND status = 'active')"
    )


def downgrade() -> None:
    op.execute(
        "DROP POLICY IF EXISTS tenant_memberships_self_discovery ON tenant_memberships"
    )
