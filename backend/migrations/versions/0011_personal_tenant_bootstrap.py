"""Permit narrowly scoped visibility for first personal-membership bootstrap.

Revision ID: 0011_personal_tenant_bootstrap
Revises: 0010_tenant_membership_discovery
"""

from collections.abc import Sequence

from alembic import op

revision: str = "0011_personal_tenant_bootstrap"
down_revision: str | None = "0010_tenant_membership_discovery"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # During first login only, the application sets this transaction-local
    # marker after inserting a personal tenant and before inserting its first
    # active membership. The marker is scoped to that exact tenant and owner.
    # Normal tenant discovery continues to require an active membership.
    op.execute(
        "CREATE POLICY tenants_personal_owner_bootstrap_select ON tenants "
        "FOR SELECT USING ("
        "id = NULLIF(current_setting('app.oidc_personal_tenant_id', true), '')::uuid "
        "AND id = NULLIF(current_setting('app.tenant_id', true), '')::uuid "
        "AND tenant_type = 'personal' "
        "AND personal_owner_user_id = NULLIF(current_setting('app.user_id', true), '')::uuid"
        ")"
    )


def downgrade() -> None:
    op.execute("DROP POLICY IF EXISTS tenants_personal_owner_bootstrap_select ON tenants")
