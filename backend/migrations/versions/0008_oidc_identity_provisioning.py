"""Add constrained first-login identity lookup and personal-workspace provisioning policies.

Revision ID: 0008_oidc_identity_provisioning
Revises: 0007_oidc_login_transactions
"""

from collections.abc import Sequence

from alembic import op

revision: str = "0008_oidc_identity_provisioning"
down_revision: str | None = "0007_oidc_login_transactions"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # Pre-auth lookup can reveal only the row matching the verified issuer and
    # subject placed in transaction-local application context.
    op.execute(
        "CREATE POLICY external_identities_oidc_lookup_select ON external_identities "
        "FOR SELECT USING (issuer = NULLIF(current_setting('app.oidc_issuer', true), '') "
        "AND subject = NULLIF(current_setting('app.oidc_subject', true), ''))"
    )

    # A user may discover their own personal tenant and active membership
    # before selecting a tenant context. Suspended memberships grant no visibility.
    op.execute(
        "CREATE POLICY tenants_personal_owner_select ON tenants FOR SELECT USING "
        "(tenant_type = 'personal' AND personal_owner_user_id = "
        "NULLIF(current_setting('app.user_id', true), '')::uuid AND EXISTS ("
        "SELECT 1 FROM tenant_memberships m WHERE m.tenant_id = tenants.id "
        "AND m.user_id = NULLIF(current_setting('app.user_id', true), '')::uuid "
        "AND m.status = 'active'))"
    )
    op.execute(
        "CREATE POLICY tenants_personal_owner_insert ON tenants FOR INSERT WITH CHECK "
        "(tenant_type = 'personal' AND status = 'active' AND personal_owner_user_id = "
        "NULLIF(current_setting('app.user_id', true), '')::uuid)"
    )
    op.execute(
        "CREATE POLICY tenant_memberships_user_select ON tenant_memberships FOR SELECT USING "
        "(user_id = NULLIF(current_setting('app.user_id', true), '')::uuid AND status = 'active')"
    )
    op.execute(
        "CREATE POLICY tenant_memberships_personal_self_insert ON tenant_memberships "
        "FOR INSERT WITH CHECK (tenant_id = "
        "NULLIF(current_setting('app.tenant_id', true), '')::uuid AND user_id = "
        "NULLIF(current_setting('app.user_id', true), '')::uuid AND status = 'active' "
        "AND EXISTS (SELECT 1 FROM tenants t WHERE t.id = tenant_memberships.tenant_id "
        "AND t.tenant_type = 'personal' AND t.personal_owner_user_id = "
        "NULLIF(current_setting('app.user_id', true), '')::uuid))"
    )
    op.execute(
        "CREATE POLICY tenant_membership_roles_learner_self_insert ON tenant_membership_roles "
        "FOR INSERT WITH CHECK (tenant_id = "
        "NULLIF(current_setting('app.tenant_id', true), '')::uuid AND role = 'learner' "
        "AND EXISTS (SELECT 1 FROM tenant_memberships m "
        "WHERE m.id = tenant_membership_roles.membership_id "
        "AND m.tenant_id = tenant_membership_roles.tenant_id "
        "AND m.user_id = NULLIF(current_setting('app.user_id', true), '')::uuid "
        "AND m.status = 'active' "
        "AND tenant_membership_roles.granted_by_user_id IS NULL))"
    )


def downgrade() -> None:
    policies = (
        ("tenant_membership_roles", "tenant_membership_roles_learner_self_insert"),
        ("tenant_memberships", "tenant_memberships_personal_self_insert"),
        ("tenant_memberships", "tenant_memberships_user_select"),
        ("tenants", "tenants_personal_owner_insert"),
        ("tenants", "tenants_personal_owner_select"),
        ("external_identities", "external_identities_oidc_lookup_select"),
    )
    for table, policy in policies:
        op.execute(f"DROP POLICY IF EXISTS {policy} ON {table}")
