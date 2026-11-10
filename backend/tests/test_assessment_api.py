from uuid import UUID

import pytest
from pydantic import ValidationError

from app.api.assessments import AttemptCreate


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
