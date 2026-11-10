from contextlib import asynccontextmanager
from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock

import httpx
import pytest
from cryptography.fernet import Fernet
from fastapi import FastAPI

from app.api import auth
from app.core.config import Settings
from app.security.oidc_provider import OIDCDiscovery
from app.security.oidc_transactions import OIDCLoginStart


def configured_settings() -> Settings:
    return Settings(
        _env_file=None,
        environment="development",
        database_required=True,
        database_url="postgresql+asyncpg://academy:unused@localhost/academy",
        oidc_issuer="https://identity.example.test",
        oidc_client_id="academy-web",
        oidc_redirect_uri="https://academy.example.test/auth/callback",
        oidc_transaction_encryption_key=Fernet.generate_key().decode("ascii"),
        oidc_allowed_origins=["https://academy.example.test"],
        oidc_post_login_redirect_url="https://academy.example.test/app",
        csrf_secret="s" * 32,
        session_cookie_secure=True,
    )


@pytest.mark.asyncio
async def test_callback_rejects_missing_or_mismatched_browser_state(monkeypatch) -> None:
    settings = configured_settings()
    monkeypatch.setattr(auth, "get_settings", lambda: settings)
    monkeypatch.setattr(
        auth, "_verifier", lambda _request: pytest.fail("verifier must not be reached")
    )
    monkeypatch.setattr(
        auth,
        "_database",
        lambda _request: pytest.fail("database must not be reached"),
    )

    app = FastAPI()
    app.include_router(auth.router)

    state = "a" * 43
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app),
        base_url="https://academy.example.test",
    ) as client:
        missing = await client.get("/auth/callback", params={"code": "code", "state": state})
        client.cookies.set(auth.OIDC_STATE_COOKIE_NAME, "b" * 43)
        mismatched = await client.get(
            "/auth/callback",
            params={"code": "code", "state": state},
        )
    assert missing.status_code == 400
    assert mismatched.status_code == 400


@pytest.mark.asyncio
async def test_callback_accepts_matching_browser_state_before_consuming_transaction(
    monkeypatch,
) -> None:
    settings = configured_settings()
    monkeypatch.setattr(auth, "get_settings", lambda: settings)
    monkeypatch.setattr(auth, "_verifier", lambda _request: object())

    async def fake_database(_request):
        return object()

    @asynccontextmanager
    async def fake_transaction_scope(_database):
        yield object()

    consume = AsyncMock(return_value=None)
    monkeypatch.setattr(auth, "_database", fake_database)
    monkeypatch.setattr(auth, "transaction_scope", fake_transaction_scope)
    monkeypatch.setattr(auth, "consume_login_transaction", consume)

    app = FastAPI()
    app.include_router(auth.router)
    state = "c" * 43
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app),
        base_url="https://academy.example.test",
    ) as client:
        client.cookies.set(auth.OIDC_STATE_COOKIE_NAME, state)
        response = await client.get(
            "/auth/callback",
            params={"code": "code", "state": state},
        )

    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid or expired sign-in transaction"
    consume.assert_awaited_once()


@pytest.mark.asyncio
async def test_login_sets_short_lived_httponly_browser_state_cookie(monkeypatch) -> None:
    settings = configured_settings()
    monkeypatch.setattr(auth, "get_settings", lambda: settings)

    class FakeVerifier:
        async def discover(self):
            return OIDCDiscovery(
                issuer=settings.oidc_issuer,
                authorization_endpoint="https://identity.example.test/authorize",
                token_endpoint="https://identity.example.test/token",  # noqa: S106 - fixed fake provider URL in a test fixture
                jwks_uri="https://identity.example.test/jwks",
            )

    monkeypatch.setattr(auth, "_verifier", lambda _request: FakeVerifier())

    async def fake_database(_request):
        return object()

    @asynccontextmanager
    async def fake_transaction_scope(_database):
        yield object()

    login = OIDCLoginStart(
        state="d" * 43,
        nonce="e" * 43,
        code_challenge="f" * 43,
        redirect_uri=settings.oidc_redirect_uri,
        expires_at=datetime.now(UTC) + timedelta(minutes=5),
    )
    create_transaction = AsyncMock(return_value=login)
    monkeypatch.setattr(auth, "_database", fake_database)
    monkeypatch.setattr(auth, "transaction_scope", fake_transaction_scope)
    monkeypatch.setattr(auth, "create_login_transaction", create_transaction)

    app = FastAPI()
    app.include_router(auth.router)
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app),
        base_url="https://academy.example.test",
        follow_redirects=False,
    ) as client:
        response = await client.get("/auth/login")

    assert response.status_code == 303
    cookie = next(
        value
        for value in response.headers.get_list("set-cookie")
        if value.startswith(f"{auth.OIDC_STATE_COOKIE_NAME}=")
    )
    assert "HttpOnly" in cookie
    assert "Secure" in cookie
    assert "SameSite=lax" in cookie
    assert "Max-Age=300" in cookie
    assert "Path=/" in cookie
    assert auth.OIDC_STATE_COOKIE_NAME.startswith("__Host-")
