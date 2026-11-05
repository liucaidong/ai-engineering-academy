"""Domain transitions for learner progress and assessment attempts.

Persistence, authorization and transaction boundaries are owned by callers.
All database writes must run through an authenticated transaction so RLS is
applied; these helpers never infer identity from request payloads.
"""
from datetime import datetime, timezone
import json
from decimal import Decimal, InvalidOperation
from typing import Any, Mapping
from uuid import UUID

from app.models.learning import AssessmentResult, LearningProgress

VALID_GRADING_MODES = {"self_review", "automated", "instructor"}


def _json_object(value: Mapping[str, Any] | None) -> dict[str, Any]:
    payload = dict(value or {})
    try:
        return json.loads(json.dumps(payload, ensure_ascii=False, allow_nan=False))
    except (TypeError, ValueError) as error:
        raise ValueError("payload must contain only finite JSON-compatible values") from error


def _aware_now(value: datetime | None = None) -> datetime:
    result = value or datetime.now(timezone.utc)
    if result.tzinfo is None or result.utcoffset() is None:
        raise ValueError("timestamps must be timezone-aware")
    return result


def start_progress(
    *,
    tenant_id: UUID,
    user_id: UUID,
    course_release_id: UUID,
    module_key: str,
    now: datetime | None = None,
) -> LearningProgress:
    key = module_key.strip()
    if not key or len(key) > 80:
        raise ValueError("module_key must contain between 1 and 80 characters")
    timestamp = _aware_now(now)
    return LearningProgress(
        tenant_id=tenant_id,
        user_id=user_id,
        course_release_id=course_release_id,
        module_key=key,
        completion_status="in_progress",
        started_at=timestamp,
        last_accessed_at=timestamp,
    )


def touch_progress(
    progress: LearningProgress,
    *,
    now: datetime | None = None,
) -> LearningProgress:
    progress.last_accessed_at = _aware_now(now)
    return progress


def complete_progress(
    progress: LearningProgress,
    *,
    now: datetime | None = None,
) -> LearningProgress:
    if progress.completion_status == "completed":
        return progress
    if progress.completion_status != "in_progress":
        raise ValueError("only in-progress modules can be completed")
    timestamp = _aware_now(now)
    progress.completion_status = "completed"
    progress.completed_at = timestamp
    progress.last_accessed_at = timestamp
    return progress


def reopen_progress(
    progress: LearningProgress,
    *,
    now: datetime | None = None,
) -> LearningProgress:
    if progress.completion_status != "completed":
        raise ValueError("only completed modules can be reopened")
    timestamp = _aware_now(now)
    progress.completion_status = "in_progress"
    progress.completed_at = None
    progress.last_accessed_at = timestamp
    return progress


def create_assessment_attempt(
    *,
    tenant_id: UUID,
    user_id: UUID,
    course_release_id: UUID,
    assessment_key: str,
    attempt_number: int,
    grading_mode: str,
    response: Mapping[str, Any] | None = None,
) -> AssessmentResult:
    key = assessment_key.strip()
    if not key or len(key) > 120:
        raise ValueError("assessment_key must contain between 1 and 120 characters")
    if attempt_number < 1:
        raise ValueError("attempt_number must be positive")
    if grading_mode not in VALID_GRADING_MODES:
        raise ValueError("unsupported grading_mode")
    return AssessmentResult(
        tenant_id=tenant_id,
        user_id=user_id,
        course_release_id=course_release_id,
        assessment_key=key,
        attempt_number=attempt_number,
        status="draft",
        grading_mode=grading_mode,
        response=_json_object(response),
    )


def submit_assessment(
    result: AssessmentResult,
    *,
    now: datetime | None = None,
) -> AssessmentResult:
    if result.status != "draft":
        raise ValueError("only draft assessment attempts can be submitted")
    result.status = "submitted"
    result.submitted_at = _aware_now(now)
    return result


def grade_assessment(
    result: AssessmentResult,
    *,
    score: Decimal | int | float | str,
    graded_by_user_id: UUID | None = None,
    now: datetime | None = None,
    feedback: Mapping[str, Any] | None = None,
) -> AssessmentResult:
    if result.status != "submitted":
        raise ValueError("only submitted assessment attempts can be graded")
    if result.grading_mode == "instructor" and graded_by_user_id is None:
        raise ValueError("instructor grading requires a reviewer identity")
    if result.grading_mode != "instructor" and graded_by_user_id is not None:
        raise ValueError("only instructor grading may record a reviewer identity")
    try:
        numeric_score = Decimal(str(score))
    except (InvalidOperation, ValueError) as error:
        raise ValueError("score must be a valid decimal") from error
    if not numeric_score.is_finite() or numeric_score < 0 or numeric_score > 100:
        raise ValueError("score must be between 0 and 100")

    result.status = "graded"
    result.score = numeric_score.quantize(Decimal("0.001"))
    result.graded_by_user_id = graded_by_user_id
    result.graded_at = _aware_now(now)
    result.feedback = _json_object(feedback) if feedback is not None else None
    return result
