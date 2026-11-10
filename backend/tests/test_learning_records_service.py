from datetime import UTC, datetime
from decimal import Decimal
from uuid import uuid4

import pytest

from app.services.learning_records import (
    complete_progress,
    create_assessment_attempt,
    grade_assessment,
    lock_record_identity,
    reopen_progress,
    start_progress,
    submit_assessment,
    update_assessment_draft,
)

NOW = datetime(2026, 11, 5, 12, 0, tzinfo=UTC)


def test_start_progress_trims_module_key_and_sets_aware_timestamps() -> None:
    progress = start_progress(
        tenant_id=uuid4(),
        user_id=uuid4(),
        course_release_id=uuid4(),
        module_key=" M01 ",
        now=NOW,
    )

    assert progress.module_key == "M01"
    assert progress.completion_status == "in_progress"
    assert progress.started_at == NOW
    assert progress.last_accessed_at == NOW
    assert progress.completed_at is None


def test_start_progress_rejects_empty_or_oversized_module_key() -> None:
    arguments = {
        "tenant_id": uuid4(),
        "user_id": uuid4(),
        "course_release_id": uuid4(),
    }
    with pytest.raises(ValueError, match="module_key"):
        start_progress(**arguments, module_key="   ")
    with pytest.raises(ValueError, match="module_key"):
        start_progress(**arguments, module_key="M" * 81)


def test_start_progress_rejects_naive_timestamp() -> None:
    with pytest.raises(ValueError, match="timezone-aware"):
        start_progress(
            tenant_id=uuid4(),
            user_id=uuid4(),
            course_release_id=uuid4(),
            module_key="M01",
            now=datetime(2026, 11, 5, 12, 0),
        )


def test_complete_progress_is_idempotent() -> None:
    progress = start_progress(
        tenant_id=uuid4(),
        user_id=uuid4(),
        course_release_id=uuid4(),
        module_key="M01",
        now=NOW,
    )

    complete_progress(progress, now=NOW)

    assert progress.completion_status == "completed"
    assert progress.completed_at == NOW
    assert complete_progress(progress, now=NOW) is progress


def test_reopen_progress_clears_completion_timestamp() -> None:
    progress = start_progress(
        tenant_id=uuid4(),
        user_id=uuid4(),
        course_release_id=uuid4(),
        module_key="M01",
        now=NOW,
    )
    complete_progress(progress, now=NOW)

    reopen_progress(progress, now=NOW)

    assert progress.completion_status == "in_progress"
    assert progress.completed_at is None


def test_progress_transition_rejects_invalid_state() -> None:
    progress = start_progress(
        tenant_id=uuid4(),
        user_id=uuid4(),
        course_release_id=uuid4(),
        module_key="M01",
        now=NOW,
    )

    with pytest.raises(ValueError, match="completed modules"):
        reopen_progress(progress, now=NOW)


def test_create_assessment_attempt_builds_json_safe_draft() -> None:
    result = create_assessment_attempt(
        tenant_id=uuid4(),
        user_id=uuid4(),
        course_release_id=uuid4(),
        assessment_key=" A01 ",
        attempt_number=1,
        grading_mode="self_review",
        response={"answer": "中文", "items": [1, 2]},
    )

    assert result.assessment_key == "A01"
    assert result.status == "draft"
    assert result.response == {"answer": "中文", "items": [1, 2]}
    assert result.submitted_at is None


def test_create_assessment_attempt_rejects_invalid_arguments() -> None:
    base = {
        "tenant_id": uuid4(),
        "user_id": uuid4(),
        "course_release_id": uuid4(),
        "assessment_key": "A01",
    }
    with pytest.raises(ValueError, match="attempt_number"):
        create_assessment_attempt(**base, attempt_number=0, grading_mode="self_review")
    with pytest.raises(ValueError, match="grading_mode"):
        create_assessment_attempt(**base, attempt_number=1, grading_mode="unknown")
    with pytest.raises(ValueError, match="assessment_key"):
        create_assessment_attempt(
            **{**base, "assessment_key": " "},
            attempt_number=1,
            grading_mode="self_review",
        )


def test_assessment_attempt_rejects_non_json_payload() -> None:
    with pytest.raises(ValueError, match="JSON-compatible"):
        create_assessment_attempt(
            tenant_id=uuid4(),
            user_id=uuid4(),
            course_release_id=uuid4(),
            assessment_key="A01",
            attempt_number=1,
            grading_mode="self_review",
            response={"invalid": object()},
        )


def test_update_assessment_draft_replaces_json_payload_without_submission() -> None:
    result = create_assessment_attempt(
        tenant_id=uuid4(),
        user_id=uuid4(),
        course_release_id=uuid4(),
        assessment_key="A01",
        attempt_number=1,
        grading_mode="self_review",
        response={"answer": "old"},
    )

    updated = update_assessment_draft(
        result,
        response={"answer": "new"},
        rubric_self_review={"reviewedCriteria": ["correctness"]},
    )

    assert updated is result
    assert result.response == {"answer": "new"}
    assert result.rubric_self_review == {"reviewedCriteria": ["correctness"]}
    assert result.status == "draft"
    assert result.submitted_at is None


def test_update_assessment_draft_rejects_submitted_attempts() -> None:
    result = create_assessment_attempt(
        tenant_id=uuid4(),
        user_id=uuid4(),
        course_release_id=uuid4(),
        assessment_key="A01",
        attempt_number=1,
        grading_mode="self_review",
    )
    submit_assessment(result, now=NOW)

    with pytest.raises(ValueError, match="only draft"):
        update_assessment_draft(result, response={"answer": "late edit"})


def test_submit_assessment_sets_submission_timestamp_once() -> None:
    result = create_assessment_attempt(
        tenant_id=uuid4(),
        user_id=uuid4(),
        course_release_id=uuid4(),
        assessment_key="A01",
        attempt_number=1,
        grading_mode="self_review",
    )

    submit_assessment(result, now=NOW)

    assert result.status == "submitted"
    assert result.submitted_at == NOW
    with pytest.raises(ValueError, match="draft"):
        submit_assessment(result, now=NOW)


def test_self_review_cannot_become_an_authoritative_grade() -> None:
    result = create_assessment_attempt(
        tenant_id=uuid4(),
        user_id=uuid4(),
        course_release_id=uuid4(),
        assessment_key="A01",
        attempt_number=1,
        grading_mode="self_review",
    )
    submit_assessment(result, now=NOW)

    with pytest.raises(ValueError, match="not an authoritative grade"):
        grade_assessment(result, score="88.25", now=NOW, feedback={"note": "reviewed"})

    assert result.status == "submitted"
    assert result.score is None


def test_instructor_grade_requires_reviewer_identity() -> None:
    result = create_assessment_attempt(
        tenant_id=uuid4(),
        user_id=uuid4(),
        course_release_id=uuid4(),
        assessment_key="A01",
        attempt_number=1,
        grading_mode="instructor",
    )
    submit_assessment(result, now=NOW)

    with pytest.raises(ValueError, match="reviewer identity"):
        grade_assessment(result, score=90, now=NOW)


def test_non_instructor_grade_rejects_reviewer_identity() -> None:
    result = create_assessment_attempt(
        tenant_id=uuid4(),
        user_id=uuid4(),
        course_release_id=uuid4(),
        assessment_key="A01",
        attempt_number=1,
        grading_mode="automated",
    )
    submit_assessment(result, now=NOW)

    with pytest.raises(ValueError, match="automated grading cannot record a reviewer identity"):
        grade_assessment(result, score=90, graded_by_user_id=uuid4(), now=NOW)


@pytest.mark.parametrize("score", [-1, 100.001, "NaN", "not-a-number"])
def test_grade_assessment_rejects_invalid_scores(score: object) -> None:
    result = create_assessment_attempt(
        tenant_id=uuid4(),
        user_id=uuid4(),
        course_release_id=uuid4(),
        assessment_key="A01",
        attempt_number=1,
        grading_mode="automated",
    )
    submit_assessment(result, now=NOW)

    with pytest.raises(ValueError, match="score"):
        grade_assessment(result, score=score, now=NOW)


def test_grade_assessment_requires_submitted_state() -> None:
    result = create_assessment_attempt(
        tenant_id=uuid4(),
        user_id=uuid4(),
        course_release_id=uuid4(),
        assessment_key="A01",
        attempt_number=1,
        grading_mode="automated",
    )

    with pytest.raises(ValueError, match="submitted"):
        grade_assessment(result, score=90, now=NOW)


def test_self_review_payload_is_stored_only_for_self_review_mode() -> None:
    result = create_assessment_attempt(
        tenant_id=uuid4(),
        user_id=uuid4(),
        course_release_id=uuid4(),
        assessment_key="A01",
        attempt_number=1,
        grading_mode="self_review",
        rubric_self_review={"criterion-1": "meets"},
    )

    assert result.rubric_self_review == {"criterion-1": "meets"}

    with pytest.raises(ValueError, match="only valid for self_review"):
        create_assessment_attempt(
            tenant_id=uuid4(),
            user_id=uuid4(),
            course_release_id=uuid4(),
            assessment_key="A01",
            attempt_number=1,
            grading_mode="automated",
            rubric_self_review={"criterion-1": "meets"},
        )


def test_instructor_grading_records_reviewer_identity() -> None:
    reviewer_id = uuid4()
    result = create_assessment_attempt(
        tenant_id=uuid4(),
        user_id=uuid4(),
        course_release_id=uuid4(),
        assessment_key="A01",
        attempt_number=1,
        grading_mode="instructor",
    )
    submit_assessment(result, now=NOW)

    grade_assessment(
        result,
        score=Decimal("91.125"),
        graded_by_user_id=reviewer_id,
        now=NOW,
    )

    assert result.status == "graded"
    assert result.graded_by_user_id == reviewer_id
    assert result.score == Decimal("91.125")


@pytest.mark.asyncio
async def test_record_identity_lock_uses_stable_parameterized_transaction_lock() -> None:
    class FakeSession:
        def __init__(self) -> None:
            self.statement = None
            self.parameters = None

        async def execute(self, statement, parameters):
            self.statement = str(statement)
            self.parameters = parameters

    session = FakeSession()
    identity = (str(uuid4()), str(uuid4()), str(uuid4()), "M01-A01")

    await lock_record_identity(
        session,
        namespace="assessment-attempt",
        identity=identity,  # type: ignore[arg-type]
    )

    assert "pg_advisory_xact_lock(hashtextextended(:lock_key, 0))" in session.statement
    assert session.parameters == {
        "lock_key": '["assessment-attempt",' + ",".join(f'"{part}"' for part in identity) + "]"
    }


@pytest.mark.asyncio
async def test_record_identity_lock_rejects_empty_identity_parts() -> None:
    class FakeSession:
        async def execute(self, *_args, **_kwargs):
            raise AssertionError("invalid lock identity must not reach the database")

    with pytest.raises(ValueError, match="non-empty"):
        await lock_record_identity(
            FakeSession(),
            namespace="learning-progress",
            identity=("tenant", ""),  # type: ignore[arg-type]
        )
