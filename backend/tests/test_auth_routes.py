import httpx
import pytest
from fastapi import FastAPI

from app.api import auth
from app.core.config import Settings


@pytest.mark.asyncio
async def test_all_auth_routes_fail_closed_without_oidc_configuration(monkeypatch) -> None:
    monkeypatch.setattr(auth, "get_settings", lambda: Settings(_env_file=None))
    app = FastAPI()
    app.include_router(auth.router)

    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app),
        base_url="https://academy.example.test",
    ) as client:
        responses = [
            await client.get("/auth/login"),
            await client.get("/auth/callback?state=not-a-valid-state"),
            await client.get("/auth/me"),
            await client.get("/auth/tenants"),
            await client.get("/auth/csrf"),
            await client.post("/auth/logout"),
        ]

    assert [response.status_code for response in responses] == [503, 503, 503, 503, 503, 503]
