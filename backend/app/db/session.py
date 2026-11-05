"""Async SQLAlchemy session and transaction boundaries."""
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import Database


@asynccontextmanager
async def session_scope(database: Database) -> AsyncIterator[AsyncSession]:
    """Yield a session; callers must explicitly choose commit semantics."""
    if database.session_factory is None:
        raise RuntimeError("Database sessions are unavailable without a configured database URL")
    async with database.session_factory() as session:
        yield session


@asynccontextmanager
async def transaction_scope(database: Database) -> AsyncIterator[AsyncSession]:
    """Yield a session with one atomic transaction, committing on success."""
    async with session_scope(database) as session:
        async with session.begin():
            yield session


async def set_security_context(
    session: AsyncSession,
    *,
    user_id: UUID,
    tenant_id: UUID | None = None,
) -> None:
    """Set transaction-local identity context consumed by PostgreSQL RLS policies.

    Must be called inside an active transaction. The values are always set with
    transaction-local scope so pooled connections cannot retain another user's
    identity or tenant after commit/rollback.
    """
    if not session.in_transaction():
        raise RuntimeError("Security context must be set inside an active transaction")

    await session.execute(
        text(
            "SELECT "
            "set_config('app.user_id', :user_id, true), "
            "set_config('app.tenant_id', :tenant_id, true), "
            "set_config('app.session_token_hash', '', true), "
            "set_config('app.oidc_state_hash', '', true)"
        ),
        {
            "user_id": str(user_id),
            "tenant_id": str(tenant_id) if tenant_id is not None else "",
        },
    )


@asynccontextmanager
async def authenticated_transaction_scope(
    database: Database,
    *,
    user_id: UUID,
    tenant_id: UUID | None = None,
) -> AsyncIterator[AsyncSession]:
    """Open an atomic transaction and set its RLS identity before yielding."""
    async with transaction_scope(database) as session:
        await set_security_context(session, user_id=user_id, tenant_id=tenant_id)
        yield session



async def set_session_lookup_context(session: AsyncSession, token_hash: str) -> None:
    """Set the narrow transaction-local RLS context used before user resolution."""
    if not session.in_transaction():
        raise RuntimeError("Session lookup context must be set inside an active transaction")
    if (
        not isinstance(token_hash, str)
        or len(token_hash) != 64
        or any(character not in "0123456789abcdef" for character in token_hash)
    ):
        raise ValueError("session token hash must be 64 lowercase hexadecimal characters")
    await session.execute(
        text(
            "SELECT "
            "set_config('app.user_id', '', true), "
            "set_config('app.tenant_id', '', true), "
            "set_config('app.session_token_hash', :token_hash, true), "
            "set_config('app.oidc_state_hash', '', true)"
        ),
        {"token_hash": token_hash},
    )


async def clear_session_lookup_context(session: AsyncSession) -> None:
    """Remove the bootstrap token hash after a missing or expired lookup."""
    if not session.in_transaction():
        raise RuntimeError("Session lookup context must be cleared inside an active transaction")
    await session.execute(
        text("SELECT set_config('app.session_token_hash', '', true)")
    )



async def set_oidc_state_context(session: AsyncSession, state_hash: str) -> None:
    """Set a pre-authentication RLS context scoped to one OIDC state hash."""
    if not session.in_transaction():
        raise RuntimeError("OIDC state context must be set inside an active transaction")
    if (
        not isinstance(state_hash, str)
        or len(state_hash) != 64
        or any(character not in "0123456789abcdef" for character in state_hash)
    ):
        raise ValueError("OIDC state hash must be 64 lowercase hexadecimal characters")
    await session.execute(
        text(
            "SELECT "
            "set_config('app.user_id', '', true), "
            "set_config('app.tenant_id', '', true), "
            "set_config('app.session_token_hash', '', true), "
            "set_config('app.oidc_state_hash', :state_hash, true)"
        ),
        {"state_hash": state_hash},
    )


async def clear_oidc_state_context(session: AsyncSession) -> None:
    """Clear the one-time OIDC state lookup context."""
    if not session.in_transaction():
        raise RuntimeError("OIDC state context must be cleared inside an active transaction")
    await session.execute(
        text("SELECT set_config('app.oidc_state_hash', '', true)")
    )
