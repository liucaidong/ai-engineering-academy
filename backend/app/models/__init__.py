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
from app.models.learning import AssessmentResult, LearningProgress

__all__ = [
    "AssessmentResult",
    "AuditEvent",
    "AuthSession",
    "CourseRelease",
    "ExternalIdentity",
    "Tenant",
    "TenantInvitation",
    "TenantMembership",
    "TenantMembershipRole",
    "LearningProgress",
    "User",
]
