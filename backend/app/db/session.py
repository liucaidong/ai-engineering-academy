"""Async SQLAlchemy session and transaction boundaries."""
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

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
