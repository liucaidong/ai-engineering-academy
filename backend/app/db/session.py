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
            "set_config('app.tenant_id', :tenant_id, true)"
        ),
        {
            "user_id": str(user_id),
            "tenant_id": str(tenant_id) if tenant_id is not None else "",
        },
    )
