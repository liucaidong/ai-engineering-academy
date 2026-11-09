"""Add dormant identity, tenant and audit foundations.

Revision ID: 0003_identity_tenancy
Revises: 0002_release_publication_state
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0003_identity_tenancy"
down_revision: str | None = "0002_release_publication_state"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("status", sa.String(length=24), server_default="active", nullable=False),
        sa.Column("display_name", sa.String(length=120), nullable=True),
        sa.Column("email", sa.String(length=320), nullable=True),
        sa.Column("email_verified_at", sa.DateTime(timezone=True), nullable=True),
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
            "status IN ('active', 'suspended', 'deletion_pending')",
            name="ck_users_status_valid",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_users"),
    )

    op.create_table(
        "external_identities",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("issuer", sa.String(length=512), nullable=False),
        sa.Column("subject", sa.String(length=255), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("last_authenticated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name="fk_external_identities_user_id_users",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_external_identities"),
        sa.UniqueConstraint("issuer", "subject", name="uq_external_identities_issuer_subject"),
    )
    op.create_index(
        "ix_external_identities_user_id", "external_identities", ["user_id"], unique=False
    )

    op.create_table(
        "auth_sessions",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("token_hash", sa.String(length=64), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("last_seen_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("token_hash ~ '^[0-9a-f]{64}$'", name="ck_auth_sessions_token_hash_hex"),
        sa.CheckConstraint(
            "expires_at > created_at", name="ck_auth_sessions_expiry_after_creation"
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name="fk_auth_sessions_user_id_users",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_auth_sessions"),
        sa.UniqueConstraint("token_hash", name="uq_auth_sessions_token_hash"),
    )
    op.create_index(
        "ix_auth_sessions_user_revoked",
        "auth_sessions",
        ["user_id", "revoked_at"],
        unique=False,
    )

    op.create_table(
        "tenants",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("tenant_type", sa.String(length=16), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("status", sa.String(length=16), server_default="active", nullable=False),
        sa.Column("personal_owner_user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "(tenant_type = 'personal' AND personal_owner_user_id IS NOT NULL) OR "
            "(tenant_type = 'organization' AND personal_owner_user_id IS NULL)",
            name="ck_tenants_personal_owner_matches_type",
        ),
        sa.CheckConstraint(
            "tenant_type IN ('personal', 'organization')",
            name="ck_tenants_tenant_type_valid",
        ),
        sa.CheckConstraint("status IN ('active', 'suspended')", name="ck_tenants_status_valid"),
        sa.ForeignKeyConstraint(
            ["personal_owner_user_id"],
            ["users.id"],
            name="fk_tenants_personal_owner_user_id_users",
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_tenants"),
        sa.UniqueConstraint("personal_owner_user_id", name="uq_tenants_personal_owner"),
    )

    op.create_table(
        "tenant_memberships",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("status", sa.String(length=16), server_default="active", nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "status IN ('active', 'suspended')",
            name="ck_tenant_memberships_status_valid",
        ),
        sa.ForeignKeyConstraint(
            ["tenant_id"],
            ["tenants.id"],
            name="fk_tenant_memberships_tenant_id_tenants",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name="fk_tenant_memberships_user_id_users",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_tenant_memberships"),
        sa.UniqueConstraint("tenant_id", "user_id", name="uq_tenant_memberships_tenant_user"),
        sa.UniqueConstraint("tenant_id", "id", name="uq_tenant_memberships_tenant_id"),
    )
    op.create_index(
        "ix_tenant_memberships_user_status",
        "tenant_memberships",
        ["user_id", "status"],
        unique=False,
    )

    op.create_table(
        "tenant_membership_roles",
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("membership_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("role", sa.String(length=24), nullable=False),
        sa.Column("granted_by_user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "role IN ('learner', 'instructor', 'tenant_admin')",
            name="ck_tenant_membership_roles_role_valid",
        ),
        sa.ForeignKeyConstraint(
            ["tenant_id", "membership_id"],
            ["tenant_memberships.tenant_id", "tenant_memberships.id"],
            name="fk_tenant_membership_roles_tenant_id_tenant_memberships",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["granted_by_user_id"],
            ["users.id"],
            name="fk_tenant_membership_roles_granted_by_user_id_users",
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("membership_id", "role", name="pk_tenant_membership_roles"),
    )
    op.create_index(
        "ix_tenant_membership_roles_tenant_role",
        "tenant_membership_roles",
        ["tenant_id", "role"],
        unique=False,
    )

    op.create_table(
        "tenant_invitations",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("invited_email", sa.String(length=320), nullable=False),
        sa.Column("role", sa.String(length=24), nullable=False),
        sa.Column("token_hash", sa.String(length=64), nullable=False),
        sa.Column("created_by_user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("accepted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "token_hash ~ '^[0-9a-f]{64}$'", name="ck_tenant_invitations_token_hash_hex"
        ),
        sa.CheckConstraint(
            "role IN ('learner', 'instructor', 'tenant_admin')",
            name="ck_tenant_invitations_role_valid",
        ),
        sa.CheckConstraint(
            "expires_at > created_at",
            name="ck_tenant_invitations_expiry_after_creation",
        ),
        sa.ForeignKeyConstraint(
            ["tenant_id"],
            ["tenants.id"],
            name="fk_tenant_invitations_tenant_id_tenants",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["created_by_user_id"],
            ["users.id"],
            name="fk_tenant_invitations_created_by_user_id_users",
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_tenant_invitations"),
        sa.UniqueConstraint("token_hash", name="uq_tenant_invitations_token_hash"),
    )
    op.create_index(
        "ix_tenant_invitations_tenant_expiry",
        "tenant_invitations",
        ["tenant_id", "expires_at"],
        unique=False,
    )

    op.create_table(
        "audit_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("actor_user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("action", sa.String(length=100), nullable=False),
        sa.Column("resource_type", sa.String(length=80), nullable=False),
        sa.Column("resource_id", sa.String(length=128), nullable=True),
        sa.Column("request_id", sa.String(length=64), nullable=False),
        sa.Column(
            "metadata",
            postgresql.JSONB(astext_type=sa.Text()),
            server_default=sa.text("'{}'::jsonb"),
            nullable=False,
        ),
        sa.Column(
            "occurred_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["actor_user_id"],
            ["users.id"],
            name="fk_audit_events_actor_user_id_users",
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["tenant_id"],
            ["tenants.id"],
            name="fk_audit_events_tenant_id_tenants",
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_audit_events"),
    )
    op.create_index(
        "ix_audit_events_tenant_time",
        "audit_events",
        ["tenant_id", "occurred_at"],
        unique=False,
    )
    op.create_index(
        "ix_audit_events_actor_time",
        "audit_events",
        ["actor_user_id", "occurred_at"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_audit_events_actor_time", table_name="audit_events")
    op.drop_index("ix_audit_events_tenant_time", table_name="audit_events")
    op.drop_table("audit_events")

    op.drop_index("ix_tenant_invitations_tenant_expiry", table_name="tenant_invitations")
    op.drop_table("tenant_invitations")

    op.drop_index("ix_tenant_membership_roles_tenant_role", table_name="tenant_membership_roles")
    op.drop_table("tenant_membership_roles")

    op.drop_index("ix_tenant_memberships_user_status", table_name="tenant_memberships")
    op.drop_table("tenant_memberships")

    op.drop_table("tenants")

    op.drop_index("ix_auth_sessions_user_revoked", table_name="auth_sessions")
    op.drop_table("auth_sessions")

    op.drop_index("ix_external_identities_user_id", table_name="external_identities")
    op.drop_table("external_identities")

    op.drop_table("users")
