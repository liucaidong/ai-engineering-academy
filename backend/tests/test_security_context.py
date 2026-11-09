from unittest.mock import AsyncMock
from uuid import UUID

import pytest

from app.db.session import set_security_context


class FakeSession:
    def __init__(self, *, active: bool) -> None:
        self.active = active
        self.execute = AsyncMock()

    def in_transaction(self) -> bool:
        return self.active


@pytest.mark.asyncio
async def test_security_context_uses_transaction_local_settings() -> None:
    session = FakeSession(active=True)
    user_id = UUID("11111111-1111-4111-8111-111111111111")
    tenant_id = UUID("22222222-2222-4222-8222-222222222222")

    await set_security_context(session, user_id=user_id, tenant_id=tenant_id)

    statement = str(session.execute.await_args.args[0])
    parameters = session.execute.await_args.args[1]
    assert "set_config('app.user_id', :user_id, true)" in statement
    assert "set_config('app.tenant_id', :tenant_id, true)" in statement
    assert "set_config('app.session_token_hash', '', true)" in statement
    assert "set_config('app.oidc_state_hash', '', true)" in statement
    assert "set_config('app.oidc_personal_tenant_id', '', true)" in statement
    assert parameters == {"user_id": str(user_id), "tenant_id": str(tenant_id)}


@pytest.mark.asyncio
async def test_security_context_clears_tenant_for_user_only_transactions() -> None:
    session = FakeSession(active=True)
    user_id = UUID("11111111-1111-4111-8111-111111111111")

    await set_security_context(session, user_id=user_id)

    parameters = session.execute.await_args.args[1]
    assert parameters == {"user_id": str(user_id), "tenant_id": ""}


@pytest.mark.asyncio
async def test_security_context_rejects_calls_outside_transaction() -> None:
    session = FakeSession(active=False)

    with pytest.raises(RuntimeError, match="active transaction"):
        await set_security_context(
            session,
            user_id=UUID("11111111-1111-4111-8111-111111111111"),
        )

    session.execute.assert_not_awaited()


@pytest.mark.asyncio
async def test_session_lookup_context_is_transaction_local_and_validated() -> None:
    from app.db.session import set_session_lookup_context

    session = FakeSession(active=True)
    token_hash = "a" * 64
    await set_session_lookup_context(session, token_hash)
    statement = str(session.execute.await_args.args[0])
    assert "set_config('app.user_id', '', true)" in statement
    assert "set_config('app.tenant_id', '', true)" in statement
    assert "set_config('app.session_token_hash', :token_hash, true)" in statement
    assert "set_config('app.oidc_issuer', '', true)" in statement
    assert "set_config('app.oidc_subject', '', true)" in statement
    assert "set_config('app.oidc_personal_tenant_id', '', true)" in statement
    assert session.execute.await_args.args[1] == {"token_hash": token_hash}

    with pytest.raises(ValueError, match="64 lowercase"):
        await set_session_lookup_context(session, "not-a-hash")


@pytest.mark.asyncio
async def test_oidc_state_context_clears_other_security_contexts() -> None:
    from app.db.session import set_oidc_state_context

    session = FakeSession(active=True)
    state_hash = "b" * 64
    await set_oidc_state_context(session, state_hash)
    statement = str(session.execute.await_args.args[0])
    assert "set_config('app.user_id', '', true)" in statement
    assert "set_config('app.tenant_id', '', true)" in statement
    assert "set_config('app.session_token_hash', '', true)" in statement
    assert "set_config('app.oidc_state_hash', :state_hash, true)" in statement
    assert "set_config('app.oidc_issuer', '', true)" in statement
    assert "set_config('app.oidc_subject', '', true)" in statement
    assert "set_config('app.oidc_issuer', '', true)" in statement
    assert "set_config('app.oidc_subject', '', true)" in statement
    assert "set_config('app.oidc_personal_tenant_id', '', true)" in statement
    assert session.execute.await_args.args[1] == {"state_hash": state_hash}


@pytest.mark.asyncio
async def test_oidc_identity_lookup_context_is_exact_and_clears_other_contexts() -> None:
    from app.db.session import set_oidc_identity_lookup_context

    session = FakeSession(active=True)
    issuer = "https://identity.example.test"
    subject = "subject-123"
    await set_oidc_identity_lookup_context(session, issuer=issuer, subject=subject)
    statement = str(session.execute.await_args.args[0])
    assert "set_config('app.oidc_issuer', :issuer, true)" in statement
    assert "set_config('app.oidc_subject', :subject, true)" in statement
    assert "set_config('app.user_id', '', true)" in statement
    assert session.execute.await_args.args[1] == {"issuer": issuer, "subject": subject}

    with pytest.raises(ValueError, match="ASCII"):
        await set_oidc_identity_lookup_context(
            session,
            issuer=issuer,
            subject="用户",
        )


@pytest.mark.asyncio
async def test_personal_tenant_bootstrap_context_is_transaction_local_and_clearable() -> None:
    from app.db.session import (
        clear_personal_tenant_bootstrap_context,
        set_personal_tenant_bootstrap_context,
    )

    session = FakeSession(active=True)
    tenant_id = UUID("33333333-3333-4333-8333-333333333333")

    await set_personal_tenant_bootstrap_context(session, tenant_id=tenant_id)
    statement = str(session.execute.await_args.args[0])
    assert "set_config('app.oidc_personal_tenant_id', :tenant_id, true)" in statement
    assert session.execute.await_args.args[1] == {"tenant_id": str(tenant_id)}

    await clear_personal_tenant_bootstrap_context(session)
    clear_statement = str(session.execute.await_args.args[0])
    assert "set_config('app.oidc_personal_tenant_id', '', true)" in clear_statement
