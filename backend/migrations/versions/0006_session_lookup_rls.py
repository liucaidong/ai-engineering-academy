"""Allow exact token-hash lookup before user identity is known.

Revision ID: 0006_session_lookup_rls
Revises: 0005_learner_records
"""

from collections.abc import Sequence

from alembic import op

revision: str = "0006_session_lookup_rls"
down_revision: str | None = "0005_learner_records"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # Authentication starts with a cookie token, before app.user_id is known.
    # This policy exposes at most the single session row matching the
    # transaction-local SHA-256 hash supplied by the trusted application.
    op.execute(
        "CREATE POLICY auth_sessions_token_hash_bootstrap_select ON auth_sessions "
        "FOR SELECT USING (token_hash = "
        "NULLIF(current_setting('app.session_token_hash', true), ''))"
    )


def downgrade() -> None:
    op.execute("DROP POLICY IF EXISTS auth_sessions_token_hash_bootstrap_select ON auth_sessions")
