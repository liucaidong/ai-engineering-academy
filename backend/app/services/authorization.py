"""Tenant-membership authorization with default-deny role permissions."""

from dataclasses import dataclass
from uuid import UUID

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.identity import Tenant, TenantMembership, TenantMembershipRole

ROLE_PERMISSIONS: dict[str, frozenset[str]] = {
    "learner": frozenset(
        {
            "course:read",
            "learning:read:self",
            "learning:write:self",
            "assessment:read:self",
            "assessment:write:self",
            "assessment:self_review",
        }
    ),
    # Instructor visibility is intentionally not granted for learner records until
    # cohort/class ownership and resource-level assignment checks exist.
    "instructor": frozenset({"course:read", "assessment:review:assigned"}),
    "tenant_admin": frozenset(
        {"tenant:members:read", "tenant:members:manage", "tenant:roles:grant", "audit:read"}
    ),
}
GRANTABLE_TENANT_ROLES = frozenset({"learner", "instructor"})


class AuthorizationDenied(PermissionError):
    """Raised when a membership lacks an explicitly granted permission."""


@dataclass(frozen=True)
class TenantPrincipal:
    user_id: UUID
    tenant_id: UUID
    membership_id: UUID
    roles: frozenset[str]

    def allows(self, permission: str) -> bool:
        if permission not in {
            item for permissions in ROLE_PERMISSIONS.values() for item in permissions
        }:
            return False
        return any(permission in ROLE_PERMISSIONS.get(role, frozenset()) for role in self.roles)


async def load_tenant_principal(
    db: AsyncSession,
    *,
    user_id: UUID,
    tenant_id: UUID,
) -> TenantPrincipal | None:
    """Resolve active membership and roles from the database, never from client claims."""
    statement = (
        select(
            TenantMembership.id, TenantMembership.status, Tenant.status, TenantMembershipRole.role
        )
        .join(Tenant, Tenant.id == TenantMembership.tenant_id)
        .outerjoin(
            TenantMembershipRole,
            and_(
                TenantMembershipRole.tenant_id == TenantMembership.tenant_id,
                TenantMembershipRole.membership_id == TenantMembership.id,
            ),
        )
        .where(
            TenantMembership.user_id == user_id,
            TenantMembership.tenant_id == tenant_id,
            TenantMembership.status == "active",
            Tenant.status == "active",
        )
    )
    result = await db.execute(statement)
    rows = result.all()
    if not rows:
        return None
    membership_id = rows[0][0]
    roles = frozenset(row[3] for row in rows if row[3] in ROLE_PERMISSIONS)
    if not roles:
        return None
    return TenantPrincipal(
        user_id=user_id,
        tenant_id=tenant_id,
        membership_id=membership_id,
        roles=roles,
    )


def require_permission(principal: TenantPrincipal, permission: str) -> None:
    """Enforce an explicit permission; unknown permissions fail closed."""
    if not principal.allows(permission):
        raise AuthorizationDenied(f"permission denied: {permission}")


def can_grant_tenant_role(principal: TenantPrincipal, role: str) -> bool:
    """Tenant admins cannot grant tenant_admin or any platform-level privilege."""
    return role in GRANTABLE_TENANT_ROLES and principal.allows("tenant:roles:grant")
