from contextlib import asynccontextmanager
from datetime import UTC, datetime
from types import SimpleNamespace
from unittest.mock import AsyncMock
from uuid import uuid4

import httpx
import pytest
from fastapi import FastAPI
from sqlalchemy.dialects import postgresql

from app.api import course_releases


def make_release(*, status="published"):
    now = datetime(2026, 11, 10, 10, 0, tzinfo=UTC)
    return SimpleNamespace(
        id=uuid4(),
        course_key="ai-engineering-foundations",
        version="0.40.9",
        schema_version=1,
        content_sha256="a" * 64,
        published_at=now,
        created_at=now,
        status=status,
        content={"schemaVersion": 1, "modules": [{"id": "M01"}]},
    )


@pytest.mark.asyncio
async def test_list_published_releases_requires_tenant_and_returns_only_metadata(monkeypatch):
    release = make_release()
    db = SimpleNamespace(
        execute=AsyncMock(
            return_value=SimpleNamespace(scalars=lambda: SimpleNamespace(all=lambda: [release]))
        )
    )
    captured = {}

    @asynccontextmanager
    async def fake_transaction(_request, *, tenant_id, permission):
        captured.update(tenant_id=tenant_id, permission=permission)
        yield db, object()

    monkeypatch.setattr(course_releases, "learner_transaction", fake_transaction)
    app = FastAPI()
    app.include_router(course_releases.router)
    tenant_id = uuid4()
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app), base_url="https://academy.example.test"
    ) as client:
        response = await client.get(
            "/courses/releases?course_key=ai-engineering-foundations&limit=10",
            headers={"X-Tenant-ID": str(tenant_id)},
        )

    assert response.status_code == 200
    payload = response.json()
    assert len(payload) == 1
    assert payload[0] == {
        "id": str(release.id),
        "course_key": "ai-engineering-foundations",
        "version": "0.40.9",
        "schema_version": 1,
        "content_sha256": "a" * 64,
        "published_at": "2026-11-10T10:00:00Z",
    }
    assert "content" not in payload[0]
    assert response.headers["cache-control"] == "no-store"
    assert captured == {"tenant_id": tenant_id, "permission": "course:read"}
    statement = db.execute.await_args.args[0]
    sql = str(
        statement.compile(dialect=postgresql.dialect(), compile_kwargs={"literal_binds": True})
    )
    assert "status = 'published'" in sql
    assert "ai-engineering-foundations" in sql


@pytest.mark.asyncio
async def test_release_detail_returns_immutable_snapshot_for_published_or_retired(monkeypatch):
    release = make_release(status="retired")
    db = SimpleNamespace(
        execute=AsyncMock(return_value=SimpleNamespace(scalar_one_or_none=lambda: release))
    )

    @asynccontextmanager
    async def fake_transaction(_request, *, tenant_id, permission):
        assert tenant_id
        assert permission == "course:read"
        yield db, object()

    monkeypatch.setattr(course_releases, "learner_transaction", fake_transaction)
    app = FastAPI()
    app.include_router(course_releases.router)
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app), base_url="https://academy.example.test"
    ) as client:
        response = await client.get(
            f"/courses/releases/{release.id}", headers={"X-Tenant-ID": str(uuid4())}
        )

    assert response.status_code == 200
    assert response.json()["status"] == "retired"
    assert response.json()["content"] == {"schemaVersion": 1, "modules": [{"id": "M01"}]}
    assert response.headers["cache-control"] == "no-store"
    statement = db.execute.await_args.args[0]
    sql = str(
        statement.compile(dialect=postgresql.dialect(), compile_kwargs={"literal_binds": True})
    )
    assert "status IN ('published', 'retired')" in sql


@pytest.mark.asyncio
async def test_release_detail_hides_drafts_and_unknown_ids_with_404(monkeypatch):
    db = SimpleNamespace(
        execute=AsyncMock(return_value=SimpleNamespace(scalar_one_or_none=lambda: None))
    )

    @asynccontextmanager
    async def fake_transaction(_request, *, tenant_id, permission):
        yield db, object()

    monkeypatch.setattr(course_releases, "learner_transaction", fake_transaction)
    app = FastAPI()
    app.include_router(course_releases.router)
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app), base_url="https://academy.example.test"
    ) as client:
        response = await client.get(
            f"/courses/releases/{uuid4()}", headers={"X-Tenant-ID": str(uuid4())}
        )

    assert response.status_code == 404
    assert response.json() == {"detail": "Published course release not found"}
