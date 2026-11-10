import httpx
import pytest
from fastapi import FastAPI
from fastapi.responses import JSONResponse

from app.security.oidc import derive_csrf_token, generate_session_token
from app.security.request_protection import CSRFSecurityMiddleware, normalize_origin
from app.security.sessions import CSRF_COOKIE_NAME, SESSION_COOKIE_NAME

SECRET = "0123456789abcdef0123456789abcdef"  # noqa: S105 - deterministic test-only secret
ORIGIN = "https://academy.example.test"


def test_normalize_origin_rejects_paths_and_opaque_origins() -> None:
    assert normalize_origin("HTTPS://Academy.Example.Test") == ORIGIN
    with pytest.raises(ValueError):
        normalize_origin("https://academy.example.test/path")
    with pytest.raises(ValueError):
        normalize_origin("null")


@pytest.mark.asyncio
async def test_cookie_authenticated_unsafe_request_requires_origin_and_csrf() -> None:
    app = FastAPI()
    app.add_middleware(
        CSRFSecurityMiddleware,
        allowed_origins={ORIGIN},
        csrf_secret=SECRET,
    )

    @app.post("/write")
    async def write():
        return JSONResponse({"ok": True})

    token = generate_session_token().raw_token
    csrf = derive_csrf_token(token, SECRET)
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url=ORIGIN) as client:
        client.cookies.set(SESSION_COOKIE_NAME, token)
        client.cookies.set(CSRF_COOKIE_NAME, csrf)
        denied_origin = await client.post(
            "/write",
            headers={"Origin": "https://evil.example.test", "X-CSRF-Token": csrf},
        )
        denied_csrf = await client.post(
            "/write",
            headers={"Origin": ORIGIN, "X-CSRF-Token": "wrong"},
        )
        accepted = await client.post(
            "/write",
            headers={"Origin": ORIGIN, "X-CSRF-Token": csrf},
        )

    assert denied_origin.status_code == 403
    assert denied_csrf.status_code == 403
    assert accepted.status_code == 200


@pytest.mark.asyncio
async def test_unsafe_request_without_session_cookie_is_not_cookie_csrf_gated() -> None:
    app = FastAPI()
    app.add_middleware(
        CSRFSecurityMiddleware,
        allowed_origins={ORIGIN},
        csrf_secret=SECRET,
    )

    @app.post("/write")
    async def write():
        return {"ok": True}

    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url=ORIGIN) as client:
        response = await client.post("/write")
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_non_ascii_csrf_header_is_rejected_without_server_error() -> None:
    app = FastAPI()
    app.add_middleware(
        CSRFSecurityMiddleware,
        allowed_origins={ORIGIN},
        csrf_secret=SECRET,
    )

    @app.post("/write")
    async def write():
        return {"ok": True}

    token = generate_session_token().raw_token
    csrf = derive_csrf_token(token, SECRET)
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app),
        base_url=ORIGIN,
    ) as client:
        client.cookies.set(SESSION_COOKIE_NAME, token)
        client.cookies.set(CSRF_COOKIE_NAME, csrf)
        response = await client.post(
            "/write",
            headers=[(b"origin", ORIGIN.encode("ascii")), (b"x-csrf-token", b"\xff")],
        )
    assert response.status_code == 403
