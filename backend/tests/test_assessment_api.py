from datetime import UTC, datetime
from uuid import UUID

import pytest
from pydantic import ValidationError

from app.api.assessments import AttemptCreate, AttemptDraftUpdate


def test_assessment_key_is_normalized_before_persistence() -> None:
    attempt = AttemptCreate(
        course_release_id=UUID("11111111-1111-4111-8111-111111111111"),
        assessment_key="  M01-A01  ",
    )

    assert attempt.assessment_key == "M01-A01"


def test_assessment_key_rejects_whitespace_only_values() -> None:
    with pytest.raises(ValidationError):
        AttemptCreate(
            course_release_id=UUID("11111111-1111-4111-8111-111111111111"),
            assessment_key="   ",
        )


def test_attempt_draft_update_rejects_oversized_payload() -> None:
    with pytest.raises(ValidationError, match="64 KiB"):
        AttemptDraftUpdate(
            response={"answer": "x" * 70000},
            expected_updated_at=datetime.now(UTC),
        )


def test_attempt_draft_update_rejects_non_finite_json_values() -> None:
    with pytest.raises(ValidationError, match="finite JSON"):
        AttemptDraftUpdate(
            response={"score": float("nan")},
            expected_updated_at=datetime.now(UTC),
        )


def test_attempt_draft_update_requires_timezone_aware_revision() -> None:
    with pytest.raises(ValidationError, match="timezone"):
        AttemptDraftUpdate(
            response={"answer": "draft"},
            expected_updated_at=datetime(2026, 11, 10, 12, 0),
        )
