from contextlib import asynccontextmanager
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from sqlalchemy.exc import IntegrityError

import app.services.authentication as authentication


def integrity_error() -> IntegrityError:
    return IntegrityError("INSERT", {}, Exception("unique constraint"))


@pytest.mark.asyncio
async def test_provision_oidc_session_retries_integrity_race_in_fresh_transaction(
    monkeypatch,
) -> None:
    transaction_entries = []

    @asynccontextmanager
    async def transaction_scope(_database):
        transaction_entries.append(len(transaction_entries) + 1)
        yield object()

    resolve_identity = AsyncMock(
        side_effect=[integrity_error(), SimpleNamespace(user_id="user-123")]
    )
    create_session = AsyncMock(return_value=(object(), "raw-session-token"))
    monkeypatch.setattr(authentication, "transaction_scope", transaction_scope)
    monkeypatch.setattr(authentication, "resolve_or_provision_oidc_identity", resolve_identity)
    monkeypatch.setattr(authentication, "create_session", create_session)

    result = await authentication.provision_oidc_session(
        object(), claims={"iss": "https://id.example", "sub": "subject"}, session_ttl_seconds=3600
    )

    assert result == "raw-session-token"
    assert len(transaction_entries) == 2
    assert resolve_identity.await_count == 2
    create_session.assert_awaited_once()
    assert create_session.await_args.kwargs["user_id"] == "user-123"
    assert create_session.await_args.kwargs["ttl"].total_seconds() == 3600


@pytest.mark.asyncio
async def test_provision_oidc_session_does_not_retry_non_integrity_failures(monkeypatch) -> None:
    transaction_entries = []

    @asynccontextmanager
    async def transaction_scope(_database):
        transaction_entries.append(1)
        yield object()

    resolve_identity = AsyncMock(side_effect=ValueError("invalid identity"))
    monkeypatch.setattr(authentication, "transaction_scope", transaction_scope)
    monkeypatch.setattr(authentication, "resolve_or_provision_oidc_identity", resolve_identity)

    with pytest.raises(ValueError, match="invalid identity"):
        await authentication.provision_oidc_session(
            object(),
            claims={"iss": "https://id.example", "sub": "subject"},
            session_ttl_seconds=3600,
        )

    assert len(transaction_entries) == 1
    resolve_identity.assert_awaited_once()
