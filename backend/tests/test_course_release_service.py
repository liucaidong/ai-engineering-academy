from datetime import UTC, datetime

import pytest

from app.services.course_releases import (
    build_course_release,
    canonical_course_json,
    course_content_digest,
    publish_course_release,
)


def test_canonical_json_is_stable_across_mapping_order() -> None:
    assert canonical_course_json({"b": 2, "a": 1}) == canonical_course_json({"a": 1, "b": 2})
    assert course_content_digest({"b": 2, "a": 1}) == course_content_digest({"a": 1, "b": 2})


def test_build_course_release_creates_draft_with_digest() -> None:
    release = build_course_release(
        course_key="  ai-engineering  ",
        version="1.2.3",
        schema_version=1,
        content={"title": "AI 工程"},
    )

    assert release.course_key == "ai-engineering"
    assert release.status == "draft"
    assert release.published_at is None
    assert release.content_sha256 == course_content_digest({"title": "AI 工程"})


@pytest.mark.parametrize(
    ("kwargs", "message"),
    [
        (
            {"course_key": " ", "version": "1.0.0", "schema_version": 1, "content": {"x": 1}},
            "course_key",
        ),
        (
            {"course_key": "course", "version": "v1", "schema_version": 1, "content": {"x": 1}},
            "semantic",
        ),
        (
            {"course_key": "course", "version": "1.0.0", "schema_version": 0, "content": {"x": 1}},
            "schema_version",
        ),
        (
            {"course_key": "course", "version": "1.0.0", "schema_version": 1, "content": {}},
            "non-empty",
        ),
    ],
)
def test_build_course_release_rejects_invalid_metadata(kwargs, message: str) -> None:
    with pytest.raises(ValueError, match=message):
        build_course_release(**kwargs)


def test_canonical_json_rejects_non_finite_numbers() -> None:
    with pytest.raises(ValueError, match="finite JSON"):
        canonical_course_json({"score": float("nan")})


def test_publish_course_release_sets_timezone_aware_timestamp() -> None:
    release = build_course_release(
        course_key="course",
        version="1.0.0",
        schema_version=1,
        content={"title": "Course"},
    )
    published_at = datetime(2026, 11, 5, 12, 0, tzinfo=UTC)

    publish_course_release(release, published_at=published_at)

    assert release.status == "published"
    assert release.published_at == published_at


def test_publish_rejects_modified_snapshot() -> None:
    release = build_course_release(
        course_key="course",
        version="1.0.0",
        schema_version=1,
        content={"title": "Original"},
    )
    release.content["title"] = "Tampered"

    with pytest.raises(ValueError, match="digest"):
        publish_course_release(release)


def test_publish_rejects_second_publication() -> None:
    release = build_course_release(
        course_key="course",
        version="1.0.0",
        schema_version=1,
        content={"title": "Course"},
    )
    publish_course_release(release)

    with pytest.raises(ValueError, match="Only draft"):
        publish_course_release(release)


def test_publish_rejects_naive_timestamp() -> None:
    release = build_course_release(
        course_key="course",
        version="1.0.0",
        schema_version=1,
        content={"title": "Course"},
    )

    with pytest.raises(ValueError, match="timezone-aware"):
        publish_course_release(release, published_at=datetime(2026, 11, 5))
