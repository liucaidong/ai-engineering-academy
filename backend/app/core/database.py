from __future__ import annotations

import asyncio
import time

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine, async_sessionmaker, create_async_engine

SCHEMA_REVISION_CACHE_TTL_SECONDS = 5.0


class Database:
    def __init__(self, database_url: str | None) -> None:
        self._engine: AsyncEngine | None = (
            create_async_engine(database_url, pool_pre_ping=True) if database_url else None
        )
        self.session_factory = (
            async_sessionmaker(self._engine, expire_on_commit=False, autoflush=False)
            if self._engine is not None
            else None
        )
        self._schema_revision_cache: dict[str, float] = {}
        self._schema_revision_lock = asyncio.Lock()

    async def check(self) -> None:
        if self._engine is None:
            raise RuntimeError("Database is required but ACADEMY_DATABASE_URL is not configured")
        async with self._engine.connect() as connection:
            await connection.execute(text("SELECT 1"))

    async def check_schema_revision(self, expected_revision: str) -> None:
        """Require the expected Alembic head, caching only successful checks briefly.

        The five-second process-local cache avoids a catalog query on every API
        request. Failed checks are never cached. Deployments must still use
        expand/contract migrations and restart/drain workers after migration.
        """
        if self._engine is None:
            raise RuntimeError("Database is not configured")
        if not expected_revision:
            raise ValueError("Expected migration revision must be non-empty")

        now = time.monotonic()
        if self._schema_revision_cache.get(expected_revision, 0.0) > now:
            return

        async with self._schema_revision_lock:
            now = time.monotonic()
            if self._schema_revision_cache.get(expected_revision, 0.0) > now:
                return

            async with self._engine.connect() as connection:
                result = await connection.execute(text("SELECT version_num FROM alembic_version"))
                revisions = tuple(result.scalars().all())
            if revisions != (expected_revision,):
                self._schema_revision_cache.pop(expected_revision, None)
                raise RuntimeError(
                    f"Database migration head mismatch: expected {expected_revision}"
                )
            self._schema_revision_cache[expected_revision] = (
                time.monotonic() + SCHEMA_REVISION_CACHE_TTL_SECONDS
            )

    def invalidate_schema_revision_cache(self) -> None:
        """Invalidate readiness checks after an in-process migration operation."""
        self._schema_revision_cache.clear()

    async def dispose(self) -> None:
        self.invalidate_schema_revision_cache()
        if self._engine is not None:
            await self._engine.dispose()
