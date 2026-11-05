from sqlalchemy import CheckConstraint, ForeignKeyConstraint, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB

from app.db.base import Base
from app.models import (
    AssessmentResult,
    CourseRelease,
    ExternalIdentity,
    LearningProgress,
    TenantMembershipRole,
)


def test_course_release_is_registered_with_metadata() -> None:
    assert "course_releases" in Base.metadata.tables
    assert CourseRelease.__tablename__ == "course_releases"


def test_course_release_has_version_uniqueness_and_guard_constraints() -> None:
    table = Base.metadata.tables["course_releases"]
    unique_columns = {
        tuple(column.name for column in constraint.columns)
        for constraint in table.constraints
        if isinstance(constraint, UniqueConstraint)
    }
    check_expressions = {
        str(constraint.sqltext)
        for constraint in table.constraints
        if isinstance(constraint, CheckConstraint)
    }

    assert ("course_key", "version") in unique_columns
    assert "schema_version > 0" in check_expressions
    assert "status IN ('draft', 'published', 'retired')" in check_expressions
    assert "content_sha256 ~ '^[0-9a-f]{64}$'" in check_expressions
    assert (
        "((status = 'draft' AND published_at IS NULL) OR "
        "(status IN ('published', 'retired') AND published_at IS NOT NULL))"
        in check_expressions
    )


def test_course_release_content_is_postgresql_jsonb() -> None:
    column = Base.metadata.tables["course_releases"].c.content
    assert column.nullable is False
    assert isinstance(column.type, JSONB)


def test_course_release_status_defaults_to_draft() -> None:
    column = Base.metadata.tables["course_releases"].c.status
    assert column.default is not None
    assert column.server_default is not None


def test_external_identity_uses_issuer_and_subject_not_email_as_key() -> None:
    table = Base.metadata.tables["external_identities"]
    unique_constraints = {
        tuple(column.name for column in constraint.columns)
        for constraint in table.constraints
        if isinstance(constraint, UniqueConstraint)
    }
    user_table = Base.metadata.tables["users"]
    email_is_unique = any(
        isinstance(constraint, UniqueConstraint)
        and tuple(column.name for column in constraint.columns) == ("email",)
        for constraint in user_table.constraints
    )

    assert ("issuer", "subject") in unique_constraints
    assert not email_is_unique
    assert ExternalIdentity.__tablename__ == "external_identities"


def test_membership_role_foreign_key_is_tenant_scoped() -> None:
    table = Base.metadata.tables["tenant_membership_roles"]
    composite_foreign_keys = [
        constraint
        for constraint in table.constraints
        if isinstance(constraint, ForeignKeyConstraint)
        and tuple(element.parent.name for element in constraint.elements)
        == ("tenant_id", "membership_id")
    ]

    assert len(composite_foreign_keys) == 1
    assert tuple(
        element.target_fullname for element in composite_foreign_keys[0].elements
    ) == ("tenant_memberships.tenant_id", "tenant_memberships.id")
    assert TenantMembershipRole.__tablename__ == "tenant_membership_roles"


def test_identity_and_tenant_tables_are_registered() -> None:
    expected = {
        "users",
        "external_identities",
        "auth_sessions",
        "tenants",
        "tenant_memberships",
        "tenant_membership_roles",
        "tenant_invitations",
        "audit_events",
    }

    assert expected.issubset(Base.metadata.tables)



def test_learning_progress_is_scoped_to_membership_and_course_release() -> None:
    table = Base.metadata.tables["learning_progress"]
    foreign_keys = [
        constraint
        for constraint in table.constraints
        if isinstance(constraint, ForeignKeyConstraint)
    ]
    assert any(
        tuple(element.target_fullname for element in constraint.elements)
        == ("tenant_memberships.tenant_id", "tenant_memberships.user_id")
        for constraint in foreign_keys
    )
    assert any(
        tuple(element.target_fullname for element in constraint.elements)
        == ("course_releases.id",)
        for constraint in foreign_keys
    )
    assert LearningProgress.__tablename__ == "learning_progress"


def test_assessment_results_have_tenant_scoped_learner_and_reviewer_keys() -> None:
    table = Base.metadata.tables["assessment_results"]
    foreign_keys = [
        constraint
        for constraint in table.constraints
        if isinstance(constraint, ForeignKeyConstraint)
    ]
    named = {constraint.name for constraint in foreign_keys}

    assert "fk_assessment_results_learner_membership" in named
    assert "fk_assessment_results_grader_membership" in named
    assert AssessmentResult.__tablename__ == "assessment_results"


def test_learning_and_assessment_tables_are_registered() -> None:
    assert {"learning_progress", "assessment_results"}.issubset(Base.metadata.tables)


def test_learning_progress_completion_timestamp_is_consistent() -> None:
    table = Base.metadata.tables["learning_progress"]
    checks = {
        str(constraint.sqltext)
        for constraint in table.constraints
        if isinstance(constraint, CheckConstraint)
    }

    assert "completion_status IN ('in_progress', 'completed')" in checks
    assert (
        "(completion_status = 'completed' AND completed_at IS NOT NULL) OR "
        "(completion_status = 'in_progress' AND completed_at IS NULL)"
        in checks
    )


def test_assessment_result_lifecycle_and_score_are_constrained() -> None:
    table = Base.metadata.tables["assessment_results"]
    checks = {
        str(constraint.sqltext)
        for constraint in table.constraints
        if isinstance(constraint, CheckConstraint)
    }

    assert "attempt_number > 0" in checks
    assert "status IN ('draft', 'submitted', 'graded')" in checks
    assert "score IS NULL OR (score >= 0 AND score <= 100)" in checks
    assert any("grading_fields_match_status" in (constraint.name or "") for constraint in table.constraints)
