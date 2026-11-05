"""Import model modules here so Alembic can discover all mapped tables."""
from app.models.course_release import CourseRelease
from app.models.identity import (
    AuditEvent,
    AuthSession,
    ExternalIdentity,
    Tenant,
    TenantInvitation,
    TenantMembership,
    TenantMembershipRole,
    User,
)

__all__ = [
    "AuditEvent",
    "AuthSession",
    "CourseRelease",
    "ExternalIdentity",
    "Tenant",
    "TenantInvitation",
    "TenantMembership",
    "TenantMembershipRole",
    "User",
]
