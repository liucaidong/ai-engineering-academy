"""OIDC subject resolution and least-privilege personal workspace provisioning."""
from dataclasses import dataclass
from datetime import datetime, timezone
from uuid import UUID, uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import (
    clear_oidc_identity_lookup_context,
    set_oidc_identity_lookup_context,
    set_security_context,
)
from app.models.identity import (
    AuditEvent,
    ExternalIdentity,
    Tenant,
    TenantMembership,
    TenantMembershipRole,
    User,
)


class OIDCIdentityRejected(PermissionError):
    """Raised when a verified external identity maps to an unusable local account."""


@dataclass(frozen=True)
class ProvisionedOIDCIdentity:
    user_id: UUID
    tenant_id: UUID
    membership_id: UUID
    created: bool


def _claim_text(value: object, *, limit: int) -> str | None:
    if not isinstance(value, str):
        return None
    normalized = value.strip()
    if not normalized or len(normalized) > limit:
        return None
    return normalized


async def resolve_or_provision_oidc_identity(
    db: AsyncSession,
    *,
    claims: dict[str, object],
    request_id: str,
    now: datetime | None = None,
) -> ProvisionedOIDCIdentity:
    """Resolve issuer+sub; create a learner-only personal workspace on first sign-in.

    Caller must run this function inside one transaction after ID-token signature,
    issuer, audience, expiry, nonce and PKCE validation have succeeded.
    """
    current = now or datetime.now(timezone.utc)
    if current.tzinfo is None:
        raise ValueError("authentication timestamp must be timezone-aware")
    issuer_claim = claims.get("iss")
    subject_claim = claims.get("sub")
    if (
        not isinstance(issuer_claim, str)
        or not issuer_claim.startswith("https://")
        or len(issuer_claim) > 512
        or not isinstance(subject_claim, str)
        or not subject_claim
        or len(subject_claim) > 255
        or not subject_claim.isascii()
    ):
        raise OIDCIdentityRejected("verified OIDC issuer or subject is invalid")
    issuer = issuer_claim
    subject = subject_claim
    if not isinstance(request_id, str) or not 1 <= len(request_id) <= 64:
        raise ValueError("request_id must contain 1 to 64 characters")

    email_claim = _claim_text(claims.get("email"), limit=320)
    email = email_claim if claims.get("email_verified") is True else None
    display_name = _claim_text(claims.get("name"), limit=120)

    await set_oidc_identity_lookup_context(db, issuer=issuer, subject=subject)
    result = await db.execute(
        select(ExternalIdentity).where(
            ExternalIdentity.issuer == issuer,
            ExternalIdentity.subject == subject,
        )
    )
    external_identity = result.scalar_one_or_none()
    await clear_oidc_identity_lookup_context(db)

    created = external_identity is None
    if external_identity is not None:
        user_id = external_identity.user_id
        await set_security_context(db, user_id=user_id)
        user_result = await db.execute(select(User).where(User.id == user_id))
        user = user_result.scalar_one_or_none()
        if user is None or user.status != "active":
            raise OIDCIdentityRejected("local account is unavailable")
        external_identity.last_authenticated_at = current
    else:
        user_id = uuid4()
        await set_security_context(db, user_id=user_id)
        user = User(
            id=user_id,
            status="active",
            display_name=display_name,
            email=email,
            email_verified_at=current if email is not None else None,
        )
        db.add(user)
        await db.flush()
        external_identity = ExternalIdentity(
            user_id=user_id,
            issuer=issuer,
            subject=subject,
            last_authenticated_at=current,
        )
        db.add(external_identity)
        await db.flush()

    # Only the user's own personal tenant is visible before tenant selection.
    await set_security_context(db, user_id=user_id)
    tenant_result = await db.execute(
        select(Tenant).where(
            Tenant.tenant_type == "personal",
            Tenant.personal_owner_user_id == user_id,
        )
    )
    tenant = tenant_result.scalar_one_or_none()
    if tenant is None:
        tenant = Tenant(
            id=uuid4(),
            tenant_type="personal",
            name="Personal workspace",
            status="active",
            personal_owner_user_id=user_id,
        )
        db.add(tenant)
        await db.flush()

    if tenant.status != "active":
        raise OIDCIdentityRejected("personal workspace is unavailable")

    await set_security_context(db, user_id=user_id, tenant_id=tenant.id)
    membership_result = await db.execute(
        select(TenantMembership).where(
            TenantMembership.tenant_id == tenant.id,
            TenantMembership.user_id == user_id,
        )
    )
    membership = membership_result.scalar_one_or_none()
    if membership is None:
        membership = TenantMembership(
            id=uuid4(),
            tenant_id=tenant.id,
            user_id=user_id,
            status="active",
        )
        db.add(membership)
        await db.flush()
    elif membership.status != "active":
        raise OIDCIdentityRejected("personal workspace membership is unavailable")

    role_result = await db.execute(
        select(TenantMembershipRole.role).where(
            TenantMembershipRole.tenant_id == tenant.id,
            TenantMembershipRole.membership_id == membership.id,
        )
    )
    roles = set(role_result.scalars().all())
    if "learner" not in roles:
        db.add(
            TenantMembershipRole(
                tenant_id=tenant.id,
                membership_id=membership.id,
                role="learner",
            )
        )
        await db.flush()

    db.add(
        AuditEvent(
            actor_user_id=user_id,
            tenant_id=tenant.id,
            action="auth.sign_in.success",
            resource_type="user",
            resource_id=str(user_id),
            request_id=request_id,
            metadata_json={"first_login": created},
        )
    )
    await db.flush()
    return ProvisionedOIDCIdentity(
        user_id=user_id,
        tenant_id=tenant.id,
        membership_id=membership.id,
        created=created,
    )
