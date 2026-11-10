import asyncio
from contextlib import asynccontextmanager
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

import app.core.database as database_module
from app.core.database import Database


class FakeEngine:
    def __init__(self, revisions: list[str]) -> None:
        self.revisions = revisions
        self.connection = SimpleNamespace(execute=AsyncMock(side_effect=self._execute))

    async def _execute(self, _statement):
        return SimpleNamespace(scalars=lambda: SimpleNamespace(all=lambda: list(self.revisions)))

    @asynccontextmanager
    async def connect(self):
        yield self.connection


@pytest.mark.asyncio
async def test_schema_revision_check_accepts_exact_single_head() -> None:
    database = Database(None)
    database._engine = FakeEngine(["0012_platform_publisher_audit"])

    await database.check_schema_revision("0012_platform_publisher_audit")


@pytest.mark.asyncio
async def test_schema_revision_check_rejects_old_or_multiple_heads() -> None:
    database = Database(None)
    database._engine = FakeEngine(["0007_oidc_login_transactions"])

    with pytest.raises(RuntimeError, match="migration head mismatch"):
        await database.check_schema_revision("0012_platform_publisher_audit")


@pytest.mark.asyncio
async def test_schema_revision_check_rejects_unconfigured_database() -> None:
    database = Database(None)
    with pytest.raises(RuntimeError, match="not configured"):
        await database.check_schema_revision("0012_platform_publisher_audit")


@pytest.mark.asyncio
async def test_schema_revision_check_caches_only_until_short_ttl(monkeypatch) -> None:
    now = [100.0]
    monkeypatch.setattr(database_module.time, "monotonic", lambda: now[0])
    database = Database(None)
    engine = FakeEngine(["0012_platform_publisher_audit"])
    database._engine = engine

    await database.check_schema_revision("0012_platform_publisher_audit")
    await database.check_schema_revision("0012_platform_publisher_audit")
    assert engine.connection.execute.await_count == 1

    now[0] += database_module.SCHEMA_REVISION_CACHE_TTL_SECONDS + 0.01
    await database.check_schema_revision("0012_platform_publisher_audit")
    assert engine.connection.execute.await_count == 2


@pytest.mark.asyncio
async def test_schema_revision_check_does_not_cache_mismatch(monkeypatch) -> None:
    monkeypatch.setattr(database_module.time, "monotonic", lambda: 100.0)
    database = Database(None)
    engine = FakeEngine(["0007_oidc_login_transactions"])
    database._engine = engine

    with pytest.raises(RuntimeError, match="migration head mismatch"):
        await database.check_schema_revision("0012_platform_publisher_audit")

    engine.revisions = ["0012_platform_publisher_audit"]
    await database.check_schema_revision("0012_platform_publisher_audit")
    assert engine.connection.execute.await_count == 2


@pytest.mark.asyncio
async def test_concurrent_schema_checks_share_one_database_query() -> None:
    database = Database(None)
    engine = FakeEngine(["0012_platform_publisher_audit"])
    database._engine = engine

    await asyncio.gather(
        *[database.check_schema_revision("0012_platform_publisher_audit") for _ in range(12)]
    )

    assert engine.connection.execute.await_count == 1


@pytest.mark.asyncio
async def test_schema_revision_cache_can_be_invalidated() -> None:
    database = Database(None)
    engine = FakeEngine(["0012_platform_publisher_audit"])
    database._engine = engine

    await database.check_schema_revision("0012_platform_publisher_audit")
    database.invalidate_schema_revision_cache()
    await database.check_schema_revision("0012_platform_publisher_audit")

    assert engine.connection.execute.await_count == 2
