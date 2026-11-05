from contextlib import asynccontextmanager
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

from app.core.database import Database


class FakeEngine:
    def __init__(self, revisions: list[str]) -> None:
        self.connection = SimpleNamespace(
            execute=AsyncMock(
                return_value=SimpleNamespace(
                    scalars=lambda: SimpleNamespace(all=lambda: revisions)
                )
            )
        )

    @asynccontextmanager
    async def connect(self):
        yield self.connection


@pytest.mark.asyncio
async def test_schema_revision_check_accepts_exact_single_head() -> None:
    database = Database(None)
    database._engine = FakeEngine(["0009_assessment_self_grading_guard"])

    await database.check_schema_revision("0009_assessment_self_grading_guard")


@pytest.mark.asyncio
async def test_schema_revision_check_rejects_old_or_multiple_heads() -> None:
    database = Database(None)
    database._engine = FakeEngine(["0007_oidc_login_transactions"])

    with pytest.raises(RuntimeError, match="migration head mismatch"):
        await database.check_schema_revision("0009_assessment_self_grading_guard")


@pytest.mark.asyncio
async def test_schema_revision_check_rejects_unconfigured_database() -> None:
    database = Database(None)
    with pytest.raises(RuntimeError, match="not configured"):
        await database.check_schema_revision("0009_assessment_self_grading_guard")
