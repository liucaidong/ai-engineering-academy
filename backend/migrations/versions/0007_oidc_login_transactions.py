"""Persist one-time OIDC login transactions under state-hash RLS.

Revision ID: 0007_oidc_login_transactions
Revises: 0006_session_lookup_rls
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0007_oidc_login_transactions"
down_revision: str | None = "0006_session_lookup_rls"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "oidc_login_transactions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("state_hash", sa.String(length=64), nullable=False),
        sa.Column("nonce_hash", sa.String(length=64), nullable=False),
        sa.Column("code_verifier_ciphertext", sa.String(length=1024), nullable=False),
        sa.Column("redirect_uri", sa.String(length=2048), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("consumed_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("state_hash", name="uq_oidc_login_transactions_state_hash"),
        sa.CheckConstraint("state_hash ~ '^[0-9a-f]{64}$'", name="state_hash_hex"),
        sa.CheckConstraint("nonce_hash ~ '^[0-9a-f]{64}$'", name="nonce_hash_hex"),
        sa.CheckConstraint("expires_at > created_at", name="expiry_after_creation"),
    )
    op.create_index(
        "ix_oidc_login_transactions_expires_at",
        "oidc_login_transactions",
        ["expires_at"],
    )
    op.execute("ALTER TABLE oidc_login_transactions ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE oidc_login_transactions FORCE ROW LEVEL SECURITY")
    op.execute(
        "CREATE POLICY oidc_login_state_select ON oidc_login_transactions "
        "FOR SELECT USING (state_hash = "
        "NULLIF(current_setting('app.oidc_state_hash', true), ''))"
    )
    op.execute(
        "CREATE POLICY oidc_login_state_insert ON oidc_login_transactions "
        "FOR INSERT WITH CHECK (state_hash = "
        "NULLIF(current_setting('app.oidc_state_hash', true), ''))"
    )
    op.execute(
        "CREATE POLICY oidc_login_state_update ON oidc_login_transactions "
        "FOR UPDATE USING (state_hash = "
        "NULLIF(current_setting('app.oidc_state_hash', true), '')) "
        "WITH CHECK (state_hash = "
        "NULLIF(current_setting('app.oidc_state_hash', true), ''))"
    )


def downgrade() -> None:
    for policy in (
        "oidc_login_state_update",
        "oidc_login_state_insert",
        "oidc_login_state_select",
    ):
        op.execute(f"DROP POLICY IF EXISTS {policy} ON oidc_login_transactions")
    op.execute("ALTER TABLE oidc_login_transactions NO FORCE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE oidc_login_transactions DISABLE ROW LEVEL SECURITY")
    op.drop_index(
        "ix_oidc_login_transactions_expires_at",
        table_name="oidc_login_transactions",
    )
    op.drop_table("oidc_login_transactions")
