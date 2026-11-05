"""Async SQLAlchemy engine lifecycle and dependency probe."""
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine


class Database:
    def __init__(self, database_url: str | None) -> None:
        self._engine: AsyncEngine | None = (
            create_async_engine(database_url, pool_pre_ping=True)
            if database_url
            else None
        )

    async def check(self) -> None:
        if self._engine is None:
            raise RuntimeError("Database is required but ACADEMY_DATABASE_URL is not configured")
        async with self._engine.connect() as connection:
            await connection.execute(text("SELECT 1"))

    async def dispose(self) -> None:
        if self._engine is not None:
            await self._engine.dispose()
