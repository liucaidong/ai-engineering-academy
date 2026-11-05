"""Domain operations for immutable course release snapshots."""
from __future__ import annotations

import hashlib
import json
import re
from collections.abc import Mapping
from datetime import UTC, datetime
from typing import Any

from app.models.course_release import CourseRelease

_SEMVER = re.compile(r"^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$")


def canonical_course_json(content: Mapping[str, Any]) -> bytes:
    """Serialize course content deterministically for stable content addressing."""
    if not isinstance(content, Mapping) or not content:
        raise ValueError("Course release content must be a non-empty JSON object")
    try:
        encoded = json.dumps(
            content,
            ensure_ascii=False,
            sort_keys=True,
            separators=(",", ":"),
            allow_nan=False,
        )
    except (TypeError, ValueError) as error:
        raise ValueError("Course release content must contain finite JSON values only") from error
    return encoded.encode("utf-8")


def course_content_digest(content: Mapping[str, Any]) -> str:
    """Return the lowercase SHA-256 digest of canonical UTF-8 course JSON."""
    return hashlib.sha256(canonical_course_json(content)).hexdigest()


def build_course_release(
    *,
    course_key: str,
    version: str,
    schema_version: int,
    content: Mapping[str, Any],
) -> CourseRelease:
    """Build a draft release; persistence is left to the caller's transaction."""
    normalized_key = course_key.strip()
    if not normalized_key or len(normalized_key) > 80:
        raise ValueError("course_key must contain between 1 and 80 characters")
    if not _SEMVER.fullmatch(version):
        raise ValueError("version must use semantic versioning")
    if schema_version < 1:
        raise ValueError("schema_version must be positive")

    snapshot = json.loads(canonical_course_json(content))
    return CourseRelease(
        course_key=normalized_key,
        version=version,
        schema_version=schema_version,
        content_sha256=course_content_digest(snapshot),
        content=snapshot,
        status="draft",
    )


def publish_course_release(
    release: CourseRelease,
    *,
    published_at: datetime | None = None,
) -> None:
    """Publish a draft exactly once after verifying its stored content digest."""
    if release.status != "draft":
        raise ValueError("Only draft course releases can be published")
    if release.published_at is not None:
        raise ValueError("Draft course releases must not have a published_at timestamp")
    if course_content_digest(release.content) != release.content_sha256:
        raise ValueError("Course release content digest does not match its snapshot")

    timestamp = published_at or datetime.now(UTC)
    if timestamp.tzinfo is None or timestamp.utcoffset() is None:
        raise ValueError("published_at must be timezone-aware")
    release.status = "published"
    release.published_at = timestamp
