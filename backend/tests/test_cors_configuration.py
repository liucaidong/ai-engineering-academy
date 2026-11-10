from types import SimpleNamespace

import httpx
import pytest
from fastapi import FastAPI

from app.main import configure_browser_security

ORIGIN = "https://academy.example.test"


@pytest.mark.asyncio
async def test_learner_api_preflight_allows_tenant_and_csrf_headers() -> None:
    app = FastAPI()
    settings = SimpleNamespace(
        oidc_login_enabled=True,
        oidc_allowed_origins=[ORIGIN],
        csrf_secret_value="0123456789abcdef0123456789abcdef",  # noqa: S106 - deterministic test-only secret
    )
    configure_browser_security(app, settings)

    @app.post("/learning/progress")
    async def create_progress() -> dict[str, bool]:
        return {"ok": True}

    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app),
        base_url=ORIGIN,
    ) as client:
        response = await client.options(
            "/learning/progress",
            headers={
                "Origin": ORIGIN,
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type,x-csrf-token,x-tenant-id",
            },
        )

    assert response.status_code == 200
    allowed_headers = response.headers["access-control-allow-headers"].lower()
    assert "x-tenant-id" in allowed_headers
    assert "x-csrf-token" in allowed_headers
    assert response.headers["access-control-allow-credentials"] == "true"
