from uuid import uuid4

import pytest

from app.services.authorization import (
    AuthorizationDenied,
    TenantPrincipal,
    can_grant_tenant_role,
    require_permission,
)


def principal(*roles: str) -> TenantPrincipal:
    return TenantPrincipal(
        user_id=uuid4(),
        tenant_id=uuid4(),
        membership_id=uuid4(),
        roles=frozenset(roles),
    )


def test_learner_has_only_self_scoped_learning_permissions() -> None:
    learner = principal("learner")
    require_permission(learner, "learning:read:self")
    require_permission(learner, "learning:write:self")
    with pytest.raises(AuthorizationDenied):
        require_permission(learner, "tenant:members:manage")
    with pytest.raises(AuthorizationDenied):
        require_permission(learner, "learning:read:tenant")


def test_instructor_does_not_receive_unscoped_learner_record_access() -> None:
    instructor = principal("instructor")
    require_permission(instructor, "assessment:review:assigned")
    with pytest.raises(AuthorizationDenied):
        require_permission(instructor, "learning:read:self")
    with pytest.raises(AuthorizationDenied):
        require_permission(instructor, "learning:read:tenant")


def test_tenant_admin_cannot_grant_admin_or_platform_roles() -> None:
    admin = principal("tenant_admin")
    require_permission(admin, "tenant:roles:grant")
    assert can_grant_tenant_role(admin, "learner")
    assert can_grant_tenant_role(admin, "instructor")
    assert not can_grant_tenant_role(admin, "tenant_admin")
    assert not can_grant_tenant_role(admin, "platform_admin")
    with pytest.raises(AuthorizationDenied):
        require_permission(admin, "platform:admin")
