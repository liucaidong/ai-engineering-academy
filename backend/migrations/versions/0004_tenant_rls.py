"""Enable fail-closed row-level security for identity and tenant tables.

Revision ID: 0004_tenant_rls
Revises: 0003_identity_tenancy
"""
from typing import Sequence, Union

from alembic import op

revision: str = "0004_tenant_rls"
down_revision: Union[str, None] = "0003_identity_tenancy"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_USER = "NULLIF(current_setting('app.user_id', true), '')::uuid"
_TENANT = "NULLIF(current_setting('app.tenant_id', true), '')::uuid"


def upgrade() -> None:
    # User-owned identity rows are visible only to the authenticated user.
    for table in ("users", "external_identities", "auth_sessions"):
        op.execute(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY")
        op.execute(f"ALTER TABLE {table} FORCE ROW LEVEL SECURITY")

    op.execute(
        f"CREATE POLICY users_self_select ON users FOR SELECT USING (id = {_USER})"
    )
    op.execute(
        f"CREATE POLICY users_self_insert ON users FOR INSERT WITH CHECK (id = {_USER})"
    )
    op.execute(
        f"CREATE POLICY users_self_update ON users FOR UPDATE "
        f"USING (id = {_USER}) WITH CHECK (id = {_USER})"
    )

    op.execute(
        f"CREATE POLICY external_identities_self_select ON external_identities "
        f"FOR SELECT USING (user_id = {_USER})"
    )
    op.execute(
        f"CREATE POLICY external_identities_self_insert ON external_identities "
        f"FOR INSERT WITH CHECK (user_id = {_USER})"
    )
    op.execute(
        f"CREATE POLICY external_identities_self_update ON external_identities "
        f"FOR UPDATE USING (user_id = {_USER}) WITH CHECK (user_id = {_USER})"
    )

    op.execute(
        f"CREATE POLICY auth_sessions_self_select ON auth_sessions "
        f"FOR SELECT USING (user_id = {_USER})"
    )
    op.execute(
        f"CREATE POLICY auth_sessions_self_insert ON auth_sessions "
        f"FOR INSERT WITH CHECK (user_id = {_USER})"
    )
    op.execute(
        f"CREATE POLICY auth_sessions_self_update ON auth_sessions "
        f"FOR UPDATE USING (user_id = {_USER}) WITH CHECK (user_id = {_USER})"
    )
    op.execute(
        f"CREATE POLICY auth_sessions_self_delete ON auth_sessions "
        f"FOR DELETE USING (user_id = {_USER})"
    )

    # Tenant metadata requires both an explicit tenant context and a live
    # membership for the current user. Missing context evaluates to NULL/false.
    for table in (
        "tenants",
        "tenant_memberships",
        "tenant_membership_roles",
        "tenant_invitations",
        "audit_events",
    ):
        op.execute(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY")
        op.execute(f"ALTER TABLE {table} FORCE ROW LEVEL SECURITY")

    op.execute(
        f"CREATE POLICY tenants_member_select ON tenants FOR SELECT USING ("
        f"id = {_TENANT} AND EXISTS ("
        f"SELECT 1 FROM tenant_memberships m "
        f"WHERE m.tenant_id = tenants.id AND m.user_id = {_USER} AND m.status = 'active'"
        f"))"
    )
    op.execute(
        f"CREATE POLICY tenant_memberships_self_select ON tenant_memberships "
        f"FOR SELECT USING (tenant_id = {_TENANT} AND user_id = {_USER})"
    )
    op.execute(
        f"CREATE POLICY tenant_membership_roles_self_select ON tenant_membership_roles "
        f"FOR SELECT USING (tenant_id = {_TENANT} AND EXISTS ("
        f"SELECT 1 FROM tenant_memberships m "
        f"WHERE m.id = tenant_membership_roles.membership_id "
        f"AND m.tenant_id = tenant_membership_roles.tenant_id "
        f"AND m.user_id = {_USER} AND m.status = 'active'"
        f"))"
    )
    op.execute(
        f"CREATE POLICY tenant_invitations_creator_select ON tenant_invitations "
        f"FOR SELECT USING (tenant_id = {_TENANT} AND created_by_user_id = {_USER})"
    )
    op.execute(
        f"CREATE POLICY tenant_invitations_creator_insert ON tenant_invitations "
        f"FOR INSERT WITH CHECK (tenant_id = {_TENANT} AND created_by_user_id = {_USER})"
    )
    op.execute(
        f"CREATE POLICY tenant_invitations_creator_update ON tenant_invitations "
        f"FOR UPDATE USING (tenant_id = {_TENANT} AND created_by_user_id = {_USER}) "
        f"WITH CHECK (tenant_id = {_TENANT} AND created_by_user_id = {_USER})"
    )
    op.execute(
        f"CREATE POLICY audit_events_actor_select ON audit_events FOR SELECT USING ("
        f"actor_user_id = {_USER} AND (tenant_id IS NULL OR tenant_id = {_TENANT})"
        f")"
    )
    op.execute(
        f"CREATE POLICY audit_events_actor_insert ON audit_events FOR INSERT WITH CHECK ("
        f"actor_user_id = {_USER} AND (tenant_id IS NULL OR tenant_id = {_TENANT})"
        f")"
    )


def downgrade() -> None:
    policies = {
        "audit_events": ("audit_events_actor_insert", "audit_events_actor_select"),
        "tenant_invitations": (
            "tenant_invitations_creator_update",
            "tenant_invitations_creator_insert",
            "tenant_invitations_creator_select",
        ),
        "tenant_membership_roles": ("tenant_membership_roles_self_select",),
        "tenant_memberships": ("tenant_memberships_self_select",),
        "tenants": ("tenants_member_select",),
        "auth_sessions": (
            "auth_sessions_self_delete",
            "auth_sessions_self_update",
            "auth_sessions_self_insert",
            "auth_sessions_self_select",
        ),
        "external_identities": (
            "external_identities_self_update",
            "external_identities_self_insert",
            "external_identities_self_select",
        ),
        "users": ("users_self_update", "users_self_insert", "users_self_select"),
    }
    for table, names in policies.items():
        for name in names:
            op.execute(f"DROP POLICY IF EXISTS {name} ON {table}")
        op.execute(f"ALTER TABLE {table} NO FORCE ROW LEVEL SECURITY")
        op.execute(f"ALTER TABLE {table} DISABLE ROW LEVEL SECURITY")
