"""Opaque application-session lifecycle and browser cookie helpers.

All database operations participate in the caller's transaction. This module
never commits, and raw session tokens are returned only to the caller that
must deliver them as Secure/HttpOnly cookies.
"""

from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from uuid import UUID

from fastapi import Response
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import (
    clear_session_lookup_context,
    set_security_context,
    set_session_lookup_context,
)
from app.models.identity import AuthSession, User
from app.security.oidc import (
    derive_csrf_token,
    generate_session_token,
    hash_session_token,
)

SESSION_COOKIE_NAME = "academy_session"
CSRF_COOKIE_NAME = "academy_csrf"


@dataclass(frozen=True)
class ResolvedSession:
    session_id: UUID
    user_id: UUID
    expires_at: datetime


def _now(value: datetime | None) -> datetime:
    current = value or datetime.now(UTC)
    if current.tzinfo is None:
        raise ValueError("session timestamps must be timezone-aware")
    return current


async def create_session(
    db: AsyncSession,
    *,
    user_id: UUID,
    ttl: timedelta,
    now: datetime | None = None,
) -> tuple[AuthSession, str]:
    """Persist a new hashed session; caller owns commit/rollback."""
    current = _now(now)
    if ttl.total_seconds() <= 0 or ttl > timedelta(days=90):
        raise ValueError("session TTL must be greater than zero and at most 90 days")
    token = generate_session_token()
    record = AuthSession(
        user_id=user_id,
        token_hash=token.token_hash,
        created_at=current,
        expires_at=current + ttl,
    )
    db.add(record)
    await db.flush()
    return record, token.raw_token


async def _lookup_unrevoked_session(
    db: AsyncSession,
    token_hash: str,
) -> AuthSession | None:
    """Use the narrow RLS bootstrap policy to resolve exactly one token hash."""
    await set_session_lookup_context(db, token_hash)
    result = await db.execute(
        select(AuthSession).where(
            AuthSession.token_hash == token_hash,
            AuthSession.revoked_at.is_(None),
        )
    )
    record = result.scalar_one_or_none()
    if record is None:
        await clear_session_lookup_context(db)
    return record


async def resolve_session(
    db: AsyncSession,
    raw_token: str,
    *,
    now: datetime | None = None,
) -> ResolvedSession | None:
    """Resolve an active session, then switch RLS from token bootstrap to user context."""
    current = _now(now)
    try:
        token_hash = hash_session_token(raw_token)
    except (TypeError, ValueError):
        return None
    record = await _lookup_unrevoked_session(db, token_hash)
    if record is None:
        return None
    if record.expires_at <= current:
        await clear_session_lookup_context(db)
        return None

    await set_security_context(db, user_id=record.user_id)
    user_result = await db.execute(select(User.status).where(User.id == record.user_id))
    if user_result.scalar_one_or_none() != "active":
        return None

    record.last_seen_at = current
    return ResolvedSession(
        session_id=record.id,
        user_id=record.user_id,
        expires_at=record.expires_at,
    )


async def revoke_session(
    db: AsyncSession,
    raw_token: str,
    *,
    now: datetime | None = None,
) -> bool:
    """Revoke a session by hash after establishing its owner RLS context."""
    current = _now(now)
    try:
        token_hash = hash_session_token(raw_token)
    except (TypeError, ValueError):
        return False
    record = await _lookup_unrevoked_session(db, token_hash)
    if record is None:
        return False
    await set_security_context(db, user_id=record.user_id)
    result = await db.execute(
        update(AuthSession)
        .where(
            AuthSession.id == record.id,
            AuthSession.user_id == record.user_id,
            AuthSession.revoked_at.is_(None),
        )
        .values(revoked_at=current)
    )
    return result.rowcount == 1


async def rotate_session(
    db: AsyncSession,
    raw_token: str,
    *,
    ttl: timedelta,
    now: datetime | None = None,
) -> tuple[AuthSession, str] | None:
    """Atomically revoke a live session and create its replacement."""
    current = _now(now)
    resolved = await resolve_session(db, raw_token, now=current)
    if resolved is None:
        return None
    if not await revoke_session(db, raw_token, now=current):
        return None
    return await create_session(db, user_id=resolved.user_id, ttl=ttl, now=current)


def set_session_cookies(
    response: Response,
    *,
    raw_session_token: str,
    csrf_secret: str | bytes,
    max_age_seconds: int,
    secure: bool = True,
) -> str:
    """Set an HttpOnly session cookie and a readable, session-bound CSRF cookie."""
    if max_age_seconds < 1:
        raise ValueError("cookie max-age must be positive")
    csrf_token = derive_csrf_token(raw_session_token, csrf_secret)
    common = {"secure": secure, "samesite": "lax", "path": "/", "max_age": max_age_seconds}
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=raw_session_token,
        httponly=True,
        **common,
    )
    response.set_cookie(
        key=CSRF_COOKIE_NAME,
        value=csrf_token,
        httponly=False,
        **common,
    )
    return csrf_token


def clear_session_cookies(response: Response, *, secure: bool = True) -> None:
    common = {"secure": secure, "samesite": "lax", "path": "/"}
    response.delete_cookie(SESSION_COOKIE_NAME, httponly=True, **common)
    response.delete_cookie(CSRF_COOKIE_NAME, httponly=False, **common)
