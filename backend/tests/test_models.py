from sqlalchemy import CheckConstraint, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB

from app.db.base import Base
from app.models import CourseRelease


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


def test_course_release_content_is_postgresql_jsonb() -> None:
    column = Base.metadata.tables["course_releases"].c.content
    assert column.nullable is False
    assert isinstance(column.type, JSONB)


def test_course_release_status_defaults_to_draft() -> None:
    column = Base.metadata.tables["course_releases"].c.status
    assert column.default is not None
    assert column.server_default is not None
