"""Learner-owned assessment attempts. No instructor grading endpoint is exposed."""

import json
from datetime import datetime
from decimal import Decimal
from typing import Annotated, Any
from uuid import UUID

from fastapi import APIRouter, Header, HTTPException, Query, Request, Response
from pydantic import BaseModel, ConfigDict, Field, model_validator
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import learner_transaction
from app.models.course_release import CourseRelease
from app.models.learning import AssessmentResult
from app.services.learning_records import (
    create_assessment_attempt,
    lock_record_identity,
    submit_assessment,
    update_assessment_draft,
)

router = APIRouter(prefix="/assessments", tags=["assessments"])


def _set_no_store(response: Response) -> None:
    response.headers["Cache-Control"] = "no-store"
    response.headers["Pragma"] = "no-cache"


class AttemptCreate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
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


class AttemptDraftUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    response: dict[str, Any]
    expected_updated_at: datetime
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
        if self.expected_updated_at.tzinfo is None or self.expected_updated_at.utcoffset() is None:
            raise ValueError("expected_updated_at must include a timezone")
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


async def _require_latest_attempt(db: AsyncSession, attempt: AssessmentResult) -> None:
    await lock_record_identity(
        db,
        namespace="assessment-attempt",
        identity=(
            str(attempt.tenant_id),
            str(attempt.user_id),
            str(attempt.course_release_id),
            attempt.assessment_key,
        ),
    )
    latest_number = await db.scalar(
        select(func.max(AssessmentResult.attempt_number)).where(
            AssessmentResult.tenant_id == attempt.tenant_id,
            AssessmentResult.user_id == attempt.user_id,
            AssessmentResult.course_release_id == attempt.course_release_id,
            AssessmentResult.assessment_key == attempt.assessment_key,
        )
    )
    if latest_number != attempt.attempt_number:
        raise HTTPException(
            status_code=409,
            detail="Only the latest assessment attempt can be edited or submitted",
        )


@router.get("/attempts", response_model=list[AttemptRead])
async def list_attempts(
    request: Request,
    response: Response,
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
        attempts = list(result.scalars().all())
    _set_no_store(response)
    return attempts


@router.post("/attempts", response_model=AttemptRead, status_code=201)
async def create_attempt(
    body: AttemptCreate,
    request: Request,
    response: Response,
    tenant_id: Annotated[UUID, Header(alias="X-Tenant-ID")],
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
            await lock_record_identity(
                db,
                namespace="assessment-attempt",
                identity=(
                    str(principal.tenant_id),
                    str(principal.user_id),
                    str(body.course_release_id),
                    body.assessment_key.strip(),
                ),
            )
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
            await db.refresh(attempt)
            _set_no_store(response)
            return attempt
    except IntegrityError as error:
        raise HTTPException(
            status_code=409, detail="Assessment attempt conflicted; retry"
        ) from error


@router.get("/attempts/drafts", response_model=list[AttemptRead])
async def list_latest_drafts(
    request: Request,
    response: Response,
    tenant_id: Annotated[UUID, Header(alias="X-Tenant-ID")],
    course_release_id: Annotated[UUID, Query()],
    limit: Annotated[int, Query(ge=1, le=500)] = 100,
):
    async with learner_transaction(
        request, tenant_id=tenant_id, permission="assessment:read:self"
    ) as (db, principal):
        latest_attempts = (
            select(
                AssessmentResult.assessment_key.label("assessment_key"),
                func.max(AssessmentResult.attempt_number).label("attempt_number"),
            )
            .where(
                AssessmentResult.tenant_id == principal.tenant_id,
                AssessmentResult.user_id == principal.user_id,
                AssessmentResult.course_release_id == course_release_id,
            )
            .group_by(AssessmentResult.assessment_key)
            .subquery()
        )
        query = (
            select(AssessmentResult)
            .join(
                latest_attempts,
                (AssessmentResult.assessment_key == latest_attempts.c.assessment_key)
                & (AssessmentResult.attempt_number == latest_attempts.c.attempt_number),
            )
            .where(
                AssessmentResult.tenant_id == principal.tenant_id,
                AssessmentResult.user_id == principal.user_id,
                AssessmentResult.course_release_id == course_release_id,
                AssessmentResult.status == "draft",
            )
            .order_by(AssessmentResult.assessment_key)
            .limit(limit)
        )
        result = await db.execute(query)
        drafts = list(result.scalars().all())

    _set_no_store(response)
    return drafts


@router.put("/attempts/{attempt_id}/draft", response_model=AttemptRead)
async def update_attempt_draft(
    attempt_id: UUID,
    body: AttemptDraftUpdate,
    request: Request,
    response: Response,
    tenant_id: Annotated[UUID, Header(alias="X-Tenant-ID")],
):
    async with learner_transaction(
        request, tenant_id=tenant_id, permission="assessment:write:self"
    ) as (db, principal):
        attempt = await _owned_attempt(db, attempt_id, principal.user_id, principal.tenant_id)
        await _require_latest_attempt(db, attempt)
        if attempt.updated_at != body.expected_updated_at:
            raise HTTPException(
                status_code=409,
                detail="Assessment draft changed on the server; reload before updating",
            )
        try:
            update_assessment_draft(
                attempt,
                response=body.response,
                rubric_self_review=body.rubric_self_review,
            )
        except ValueError as error:
            raise HTTPException(status_code=409, detail=str(error)) from error
        await db.flush()
        await db.refresh(attempt)
        _set_no_store(response)
        return attempt


@router.post("/attempts/{attempt_id}/submit", response_model=AttemptRead)
async def submit_attempt(
    attempt_id: UUID,
    request: Request,
    response: Response,
    tenant_id: Annotated[UUID, Header(alias="X-Tenant-ID")],
):
    async with learner_transaction(
        request, tenant_id=tenant_id, permission="assessment:write:self"
    ) as (db, principal):
        attempt = await _owned_attempt(db, attempt_id, principal.user_id, principal.tenant_id)
        await _require_latest_attempt(db, attempt)
        try:
            submit_assessment(attempt)
        except ValueError as error:
            raise HTTPException(status_code=409, detail=str(error)) from error
        await db.flush()
        await db.refresh(attempt)
        _set_no_store(response)
        return attempt
