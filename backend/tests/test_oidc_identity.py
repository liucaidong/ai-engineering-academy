from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest

from app.models.identity import (
    AuditEvent,
    ExternalIdentity,
    Tenant,
    TenantMembership,
    TenantMembershipRole,
    User,
)
from app.services.oidc_identity import (
    OIDCIdentityRejected,
    resolve_or_provision_oidc_identity,
)


def result_one(value):
    return SimpleNamespace(scalar_one_or_none=lambda: value)


def result_scalars(values):
    return SimpleNamespace(scalars=lambda: SimpleNamespace(all=lambda: values))


@pytest.mark.asyncio
async def test_first_oidc_login_provisions_only_learner_personal_workspace() -> None:
    db = SimpleNamespace(
        execute=AsyncMock(
            side_effect=[
                None,  # exact issuer/subject lookup context
                result_one(None),  # no external identity
                None,  # clear pre-auth identity lookup context
                None,  # set user context before user insert
                None,  # set user context before personal tenant lookup
                result_one(None),  # no personal tenant
                None,  # set user + tenant context
                result_one(None),  # no active membership
                result_scalars([]),  # no existing role grants
            ]
        ),
        add=MagicMock(),
        flush=AsyncMock(),
        in_transaction=MagicMock(return_value=True),
    )

    result = await resolve_or_provision_oidc_identity(
        db,
        claims={
            "iss": "https://identity.example.test",
            "sub": "subject-123",
            "name": "Learner",
            "email": "learner@example.test",
            "email_verified": True,
        },
        request_id="request-123",
    )

    added = [call.args[0] for call in db.add.call_args_list]
    user = next(item for item in added if isinstance(item, User))
    identity = next(item for item in added if isinstance(item, ExternalIdentity))
    tenant = next(item for item in added if isinstance(item, Tenant))
    membership = next(item for item in added if isinstance(item, TenantMembership))
    role = next(item for item in added if isinstance(item, TenantMembershipRole))
    audit = next(item for item in added if isinstance(item, AuditEvent))

    assert result.created is True
    assert result.user_id == user.id
    assert result.tenant_id == tenant.id
    assert result.membership_id == membership.id
    assert identity.issuer == "https://identity.example.test"
    assert identity.subject == "subject-123"
    assert user.email == "learner@example.test"
    assert user.email_verified_at is not None
    assert tenant.tenant_type == "personal"
    assert tenant.personal_owner_user_id == user.id
    assert membership.user_id == user.id
    assert membership.tenant_id == tenant.id
    assert role.role == "learner"
    assert role.membership_id == membership.id
    assert audit.action == "auth.sign_in.success"
    assert audit.metadata_json == {"first_login": True}
    assert db.flush.await_count == 6


@pytest.mark.asyncio
async def test_unverified_email_is_not_persisted() -> None:
    db = SimpleNamespace(
        execute=AsyncMock(
            side_effect=[
                None,
                result_one(None),
                None,
                None,
                None,
                result_one(None),
                None,
                result_one(None),
                result_scalars([]),
            ]
        ),
        add=MagicMock(),
        flush=AsyncMock(),
        in_transaction=MagicMock(return_value=True),
    )

    await resolve_or_provision_oidc_identity(
        db,
        claims={
            "iss": "https://identity.example.test",
            "sub": "subject-456",
            "email": "unverified@example.test",
            "email_verified": False,
        },
        request_id="request-456",
    )
    user = next(
        call.args[0] for call in db.add.call_args_list if isinstance(call.args[0], User)
    )
    assert user.email is None
    assert user.email_verified_at is None


@pytest.mark.asyncio
async def test_oidc_identity_rejects_non_ascii_subject_before_database_access() -> None:
    db = SimpleNamespace(execute=AsyncMock())

    with pytest.raises(OIDCIdentityRejected, match="issuer or subject"):
        await resolve_or_provision_oidc_identity(
            db,
            claims={"iss": "https://identity.example.test", "sub": "用户"},
            request_id="request-789",
        )
    db.execute.assert_not_awaited()
