"""Async SQLAlchemy engine lifecycle and dependency probe."""
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine, async_sessionmaker, create_async_engine


class Database:
    def __init__(self, database_url: str | None) -> None:
        self._engine: AsyncEngine | None = (
            create_async_engine(database_url, pool_pre_ping=True)
            if database_url
            else None
        )
        self.session_factory = (
            async_sessionmaker(self._engine, expire_on_commit=False, autoflush=False)
            if self._engine is not None
            else None
        )

    async def check(self) -> None:
        if self._engine is None:
            raise RuntimeError("Database is required but ACADEMY_DATABASE_URL is not configured")
        async with self._engine.connect() as connection:
            await connection.execute(text("SELECT 1"))

    async def check_schema_revision(self, expected_revision: str) -> None:
        """Require the Alembic database head expected by the running API slice."""
        if self._engine is None:
            raise RuntimeError("Database is not configured")
        if not expected_revision:
            raise ValueError("Expected migration revision must be non-empty")
        async with self._engine.connect() as connection:
            result = await connection.execute(text("SELECT version_num FROM alembic_version"))
            revisions = tuple(result.scalars().all())
        if revisions != (expected_revision,):
            raise RuntimeError(
                f"Database migration head mismatch: expected {expected_revision}"
            )

    async def dispose(self) -> None:
        if self._engine is not None:
            await self._engine.dispose()
