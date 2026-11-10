from contextlib import asynccontextmanager
from types import SimpleNamespace
from unittest.mock import AsyncMock
from uuid import uuid4

import httpx
import pytest
from fastapi import FastAPI

from app.api import tenants
from app.core.config import Settings
from app.security.sessions import SESSION_COOKIE_NAME


@pytest.mark.asyncio
async def test_tenant_discovery_is_disabled_by_default(monkeypatch):
    monkeypatch.setattr(tenants, "get_settings", lambda: Settings(_env_file=None))
    app = FastAPI()
    app.include_router(tenants.router)

    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app),
        base_url="https://academy.example.test",
    ) as client:
        response = await client.get("/tenants/me")

    assert response.status_code == 503
    assert response.json() == {"detail": "Tenant discovery is disabled"}


@pytest.mark.asyncio
async def test_tenant_discovery_rejects_missing_session(monkeypatch):
    monkeypatch.setattr(
        tenants,
        "get_settings",
        lambda: SimpleNamespace(oidc_login_enabled=True, learner_data_api_enabled=True),
    )

    class Database:
        async def check_schema_revision(self, revision):
            assert revision == "0011_personal_tenant_bootstrap"

    @asynccontextmanager
    async def fake_transaction_scope(_database):
        yield object()

    monkeypatch.setattr(tenants, "transaction_scope", fake_transaction_scope)
    app = FastAPI()
    app.state.database = Database()
    app.include_router(tenants.router)

    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app),
        base_url="https://academy.example.test",
    ) as client:
        response = await client.get("/tenants/me")

    assert response.status_code == 401
    assert response.json() == {"detail": "Authentication required"}


@pytest.mark.asyncio
async def test_active_tenant_discovery_groups_roles_and_rechecks_membership(monkeypatch):
    user_id = uuid4()
    tenant_a, tenant_b = uuid4(), uuid4()
    membership_result = SimpleNamespace(
        scalars=lambda: SimpleNamespace(all=lambda: [tenant_a, tenant_b])
    )
    tenant_a_result = SimpleNamespace(
        all=lambda: [
            (tenant_a, "Personal workspace", "personal", "learner"),
            (tenant_a, "Personal workspace", "personal", "tenant_admin"),
        ]
    )
    # An empty second query represents a membership suspended between discovery
    # and the tenant-scoped metadata query. It must be omitted.
    tenant_b_result = SimpleNamespace(all=lambda: [])
    db = SimpleNamespace(
        execute=AsyncMock(side_effect=[membership_result, tenant_a_result, tenant_b_result])
    )
    set_context = AsyncMock()
    monkeypatch.setattr(tenants, "set_security_context", set_context)

    result = await tenants._list_active_tenants(db, user_id=user_id)

    assert len(result) == 1
    assert result[0].tenant_id == tenant_a
    assert result[0].name == "Personal workspace"
    assert result[0].tenant_type == "personal"
    assert result[0].roles == ["learner", "tenant_admin"]
    assert set_context.await_count == 2
    assert set_context.await_args_list[0].kwargs == {
        "user_id": user_id,
        "tenant_id": tenant_a,
    }
    assert set_context.await_args_list[1].kwargs == {
        "user_id": user_id,
        "tenant_id": tenant_b,
    }


@pytest.mark.asyncio
async def test_authenticated_tenant_discovery_returns_session_scoped_memberships(
    monkeypatch,
):
    user_id = uuid4()
    tenant_id = uuid4()
    membership = tenants.TenantMembershipRead(
        tenant_id=tenant_id,
        name="Personal workspace",
        tenant_type="personal",
        roles=["learner"],
    )
    monkeypatch.setattr(
        tenants,
        "get_settings",
        lambda: SimpleNamespace(oidc_login_enabled=True, learner_data_api_enabled=True),
    )

    class Database:
        async def check_schema_revision(self, revision):
            assert revision == "0011_personal_tenant_bootstrap"

    @asynccontextmanager
    async def fake_transaction_scope(_database):
        yield object()

    monkeypatch.setattr(tenants, "transaction_scope", fake_transaction_scope)
    monkeypatch.setattr(
        tenants,
        "resolve_session",
        AsyncMock(return_value=SimpleNamespace(user_id=user_id)),
    )
    list_tenants = AsyncMock(return_value=[membership])
    monkeypatch.setattr(tenants, "_list_active_tenants", list_tenants)

    app = FastAPI()
    app.state.database = Database()
    app.include_router(tenants.router)

    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app),
        base_url="https://academy.example.test",
        cookies={SESSION_COOKIE_NAME: "opaque-session-token"},
    ) as client:
        response = await client.get("/tenants/me")

    assert response.status_code == 200
    assert response.json() == [
        {
            "tenant_id": str(tenant_id),
            "name": "Personal workspace",
            "tenant_type": "personal",
            "roles": ["learner"],
        }
    ]
    assert response.headers["cache-control"] == "no-store"
    list_tenants.assert_awaited_once()
    assert list_tenants.await_args.kwargs == {"user_id": user_id}
