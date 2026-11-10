from datetime import UTC, datetime, timedelta
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest
from fastapi import Response

from app.models.identity import AuthSession
from app.security.oidc import generate_session_token
from app.security.sessions import (
    CSRF_COOKIE_NAME,
    SESSION_COOKIE_NAME,
    create_session,
    resolve_session,
    revoke_session,
    set_session_cookies,
)

SECRET = "0123456789abcdef0123456789abcdef"  # noqa: S105 - deterministic test-only secret


@pytest.mark.asyncio
async def test_create_session_persists_only_hash_and_returns_raw_cookie_token() -> None:
    db = SimpleNamespace(add=MagicMock(), flush=AsyncMock())
    user_id = uuid4()
    now = datetime(2026, 11, 5, tzinfo=UTC)

    record, raw_token = await create_session(db, user_id=user_id, ttl=timedelta(hours=8), now=now)

    assert record.user_id == user_id
    assert record.token_hash != raw_token
    assert len(record.token_hash) == 64
    assert record.created_at == now
    assert record.expires_at == now + timedelta(hours=8)
    db.add.assert_called_once_with(record)
    db.flush.assert_awaited_once()


@pytest.mark.asyncio
async def test_session_ttl_and_naive_timestamps_are_rejected() -> None:
    db = SimpleNamespace(add=AsyncMock(), flush=AsyncMock())
    with pytest.raises(ValueError, match="TTL"):
        await create_session(db, user_id=uuid4(), ttl=timedelta(0))
    with pytest.raises(ValueError, match="timezone-aware"):
        await create_session(
            db,
            user_id=uuid4(),
            ttl=timedelta(hours=1),
            now=datetime(2026, 11, 5),
        )


@pytest.mark.asyncio
async def test_revoke_session_uses_hash_and_returns_rowcount() -> None:
    token = generate_session_token()
    now = datetime(2026, 11, 5, tzinfo=UTC)
    record = AuthSession(
        id=uuid4(),
        user_id=uuid4(),
        token_hash=token.token_hash,
        created_at=now,
        expires_at=now + timedelta(hours=1),
    )
    results = [
        None,  # set transaction-local token-hash bootstrap context
        SimpleNamespace(scalar_one_or_none=lambda: record),
        None,  # acquire exclusive lifecycle lock
        None,  # switch to authenticated user context
        SimpleNamespace(rowcount=1),
    ]
    db = SimpleNamespace(
        execute=AsyncMock(side_effect=results),
        in_transaction=MagicMock(return_value=True),
    )

    assert await revoke_session(db, token.raw_token, now=now)
    assert db.execute.await_count == 5
    assert "pg_advisory_xact_lock(" in str(db.execute.call_args_list[2].args[0])


def test_session_cookies_have_http_only_session_and_readable_csrf() -> None:
    response = Response()
    raw_token = generate_session_token().raw_token

    csrf = set_session_cookies(
        response,
        raw_session_token=raw_token,
        csrf_secret=SECRET,
        max_age_seconds=3600,
    )
    headers = response.headers.getlist("set-cookie")

    session_cookie = next(value for value in headers if value.startswith(SESSION_COOKIE_NAME + "="))
    csrf_cookie = next(value for value in headers if value.startswith(CSRF_COOKIE_NAME + "="))
    assert "httponly" in session_cookie.lower()
    assert "secure" in session_cookie.lower()
    assert "samesite=lax" in session_cookie.lower()
    assert "httponly" not in csrf_cookie.lower()
    assert csrf in csrf_cookie


@pytest.mark.asyncio
async def test_resolve_session_switches_from_token_hash_to_user_context() -> None:
    token = generate_session_token()
    now = datetime(2026, 11, 5, tzinfo=UTC)
    record = AuthSession(
        id=uuid4(),
        user_id=uuid4(),
        token_hash=token.token_hash,
        created_at=now - timedelta(minutes=1),
        expires_at=now + timedelta(hours=1),
    )
    results = [
        None,  # set transaction-local token-hash bootstrap context
        SimpleNamespace(scalar_one_or_none=lambda: record),
        None,  # acquire shared lifecycle lock
        None,  # switch to authenticated user context
        SimpleNamespace(scalar_one_or_none=lambda: record),  # re-check active session
        SimpleNamespace(scalar_one_or_none=lambda: "active"),
    ]
    db = SimpleNamespace(
        execute=AsyncMock(side_effect=results),
        in_transaction=MagicMock(return_value=True),
    )

    resolved = await resolve_session(db, token.raw_token, now=now)

    assert resolved is not None
    assert resolved.user_id == record.user_id
    assert resolved.session_id == record.id
    assert "greatest" in str(record.last_seen_at).lower()
    assert db.execute.await_count == 6
    assert "pg_advisory_xact_lock_shared" in str(db.execute.call_args_list[2].args[0])
