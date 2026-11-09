"""Learner-owned assessment attempts. No instructor grading endpoint is exposed."""

import json
from datetime import datetime
from decimal import Decimal
from typing import Annotated, Any
from uuid import UUID

from fastapi import APIRouter, Header, HTTPException, Query, Request
from pydantic import BaseModel, ConfigDict, Field, model_validator
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError

from app.api.dependencies import learner_transaction
from app.models.course_release import CourseRelease
from app.models.learning import AssessmentResult
from app.services.learning_records import create_assessment_attempt, submit_assessment

router = APIRouter(prefix="/assessments", tags=["assessments"])


class AttemptCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    course_release_id: UUID
    assessment_key: str = Field(min_length=1, max_length=120)
    response: dict[str, Any] = Field(default_factory=dict)
    rubric_self_review: dict[str, Any] | None = None

    @model_validator(mode="after")
    def validate_json_size(self):
        for value in (self.response, self.rubric_self_review):
            if value is not None:
                try:
                    size = len(
                        json.dumps(value, ensure_ascii=False, allow_nan=False).encode("utf-8")
                    )
                except (TypeError, ValueError) as error:
                    raise ValueError("payload must contain finite JSON values") from error
                if size > 65536:
                    raise ValueError("assessment payload exceeds 64 KiB")
        return self


class AttemptRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    course_release_id: UUID
    assessment_key: str
    attempt_number: int
    status: str
    grading_mode: str
    response: dict[str, Any]
    rubric_self_review: dict[str, Any] | None
    score: Decimal | None
    submitted_at: datetime | None
    graded_at: datetime | None
    created_at: datetime
    updated_at: datetime


def _assessment_exists(release: CourseRelease, key: str) -> bool:
    content = release.content if isinstance(release.content, dict) else {}
    modules = content.get("modules")
    if not isinstance(modules, list):
        return False
    for module in modules:
        if not isinstance(module, dict) or not isinstance(module.get("lessons"), list):
            continue
        for lesson in module["lessons"]:
            if not isinstance(lesson, dict) or not isinstance(lesson.get("assessments"), list):
                continue
            if any(
                isinstance(item, dict) and item.get("id") == key for item in lesson["assessments"]
            ):
                return True
    return False


async def _owned_attempt(db, attempt_id: UUID, user_id: UUID, tenant_id: UUID):
    result = await db.execute(
        select(AssessmentResult)
        .where(
            AssessmentResult.id == attempt_id,
            AssessmentResult.user_id == user_id,
            AssessmentResult.tenant_id == tenant_id,
        )
        .with_for_update()
    )
    value = result.scalar_one_or_none()
    if value is None:
        raise HTTPException(status_code=404, detail="Assessment attempt not found")
    return value


@router.get("/attempts", response_model=list[AttemptRead])
async def list_attempts(
    request: Request,
    tenant_id: Annotated[UUID, Header(alias="X-Tenant-ID")],
    course_release_id: Annotated[UUID | None, Query()] = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
):
    async with learner_transaction(
        request, tenant_id=tenant_id, permission="assessment:read:self"
    ) as (db, principal):
        query = select(AssessmentResult).where(
            AssessmentResult.tenant_id == principal.tenant_id,
            AssessmentResult.user_id == principal.user_id,
        )
        if course_release_id:
            query = query.where(AssessmentResult.course_release_id == course_release_id)
        result = await db.execute(query.order_by(AssessmentResult.created_at.desc()).limit(limit))
        return list(result.scalars().all())


@router.post("/attempts", response_model=AttemptRead, status_code=201)
async def create_attempt(
    body: AttemptCreate, request: Request, tenant_id: Annotated[UUID, Header(alias="X-Tenant-ID")]
):
    try:
        async with learner_transaction(
            request, tenant_id=tenant_id, permission="assessment:write:self"
        ) as (db, principal):
            result = await db.execute(
                select(CourseRelease).where(
                    CourseRelease.id == body.course_release_id,
                    CourseRelease.status == "published",
                )
            )
            release = result.scalar_one_or_none()
            if release is None or not _assessment_exists(release, body.assessment_key.strip()):
                raise HTTPException(status_code=404, detail="Published assessment not found")
            latest = await db.execute(
                select(func.max(AssessmentResult.attempt_number)).where(
                    AssessmentResult.tenant_id == principal.tenant_id,
                    AssessmentResult.user_id == principal.user_id,
                    AssessmentResult.course_release_id == body.course_release_id,
                    AssessmentResult.assessment_key == body.assessment_key.strip(),
                )
            )
            attempt = create_assessment_attempt(
                tenant_id=principal.tenant_id,
                user_id=principal.user_id,
                course_release_id=body.course_release_id,
                assessment_key=body.assessment_key,
                attempt_number=(latest.scalar_one() or 0) + 1,
                grading_mode="self_review",
                response=body.response,
                rubric_self_review=body.rubric_self_review,
            )
            db.add(attempt)
            await db.flush()
            return attempt
    except IntegrityError as error:
        raise HTTPException(
            status_code=409, detail="Assessment attempt conflicted; retry"
        ) from error


@router.post("/attempts/{attempt_id}/submit", response_model=AttemptRead)
async def submit_attempt(
    attempt_id: UUID, request: Request, tenant_id: Annotated[UUID, Header(alias="X-Tenant-ID")]
):
    async with learner_transaction(
        request, tenant_id=tenant_id, permission="assessment:write:self"
    ) as (db, principal):
        attempt = await _owned_attempt(db, attempt_id, principal.user_id, principal.tenant_id)
        try:
            submit_assessment(attempt)
        except ValueError as error:
            raise HTTPException(status_code=409, detail=str(error)) from error
        await db.flush()
        return attempt
