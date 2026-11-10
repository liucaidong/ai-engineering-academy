"""Self-scoped learner progress API; instructor access is intentionally absent."""

from datetime import datetime
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Header, HTTPException, Query, Request
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.api.dependencies import learner_transaction
from app.models.course_release import CourseRelease
from app.models.learning import LearningProgress
from app.services.learning_records import (
    complete_progress,
    lock_record_identity,
    reopen_progress,
    start_progress,
    touch_progress,
)

router = APIRouter(prefix="/learning", tags=["learning"])


class ProgressCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    course_release_id: UUID
    module_key: str = Field(min_length=1, max_length=80)


class ProgressRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    course_release_id: UUID
    module_key: str
    completion_status: str
    started_at: datetime
    completed_at: datetime | None
    last_accessed_at: datetime
    updated_at: datetime


def _contains_module(release: CourseRelease, module_key: str) -> bool:
    modules = release.content.get("modules") if isinstance(release.content, dict) else None
    return isinstance(modules, list) and any(
        isinstance(module, dict) and module.get("id") == module_key for module in modules
    )


async def _owned_progress(db, progress_id: UUID, user_id: UUID, tenant_id: UUID):
    result = await db.execute(
        select(LearningProgress)
        .where(
            LearningProgress.id == progress_id,
            LearningProgress.user_id == user_id,
            LearningProgress.tenant_id == tenant_id,
        )
        .with_for_update()
    )
    progress = result.scalar_one_or_none()
    if progress is None:
        raise HTTPException(status_code=404, detail="Progress record not found")
    return progress


@router.get("/progress", response_model=list[ProgressRead])
async def list_progress(
    request: Request,
    tenant_id: Annotated[UUID, Header(alias="X-Tenant-ID")],
    course_release_id: Annotated[UUID | None, Query()] = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
):
    async with learner_transaction(
        request, tenant_id=tenant_id, permission="learning:read:self"
    ) as (db, principal):
        query = select(LearningProgress).where(
            LearningProgress.tenant_id == principal.tenant_id,
            LearningProgress.user_id == principal.user_id,
        )
        if course_release_id is not None:
            query = query.where(LearningProgress.course_release_id == course_release_id)
        result = await db.execute(
            query.order_by(LearningProgress.last_accessed_at.desc()).limit(limit)
        )
        return list(result.scalars().all())


@router.post("/progress", response_model=ProgressRead, status_code=201)
async def begin_progress(
    body: ProgressCreate,
    request: Request,
    tenant_id: Annotated[UUID, Header(alias="X-Tenant-ID")],
):
    key = body.module_key.strip()
    if not key:
        raise HTTPException(status_code=422, detail="module_key must not be blank")
    try:
        async with learner_transaction(
            request, tenant_id=tenant_id, permission="learning:write:self"
        ) as (db, principal):
            result = await db.execute(
                select(CourseRelease).where(
                    CourseRelease.id == body.course_release_id, CourseRelease.status == "published"
                )
            )
            release = result.scalar_one_or_none()
            if release is None or not _contains_module(release, key):
                raise HTTPException(status_code=404, detail="Published course module not found")
            await lock_record_identity(
                db,
                namespace="learning-progress",
                identity=(
                    str(principal.tenant_id),
                    str(principal.user_id),
                    str(body.course_release_id),
                    key,
                ),
            )
            existing = await db.execute(
                select(LearningProgress)
                .where(
                    LearningProgress.tenant_id == principal.tenant_id,
                    LearningProgress.user_id == principal.user_id,
                    LearningProgress.course_release_id == body.course_release_id,
                    LearningProgress.module_key == key,
                )
                .with_for_update()
            )
            progress = existing.scalar_one_or_none()
            if progress is None:
                progress = start_progress(
                    tenant_id=principal.tenant_id,
                    user_id=principal.user_id,
                    course_release_id=body.course_release_id,
                    module_key=key,
                )
                db.add(progress)
            else:
                touch_progress(progress)
            await db.flush()
            return progress
    except IntegrityError as error:
        raise HTTPException(
            status_code=409, detail="Progress record already exists; retry"
        ) from error


@router.post("/progress/{progress_id}/complete", response_model=ProgressRead)
async def mark_progress_complete(
    progress_id: UUID, request: Request, tenant_id: Annotated[UUID, Header(alias="X-Tenant-ID")]
):
    async with learner_transaction(
        request, tenant_id=tenant_id, permission="learning:write:self"
    ) as (db, principal):
        progress = await _owned_progress(db, progress_id, principal.user_id, principal.tenant_id)
        try:
            complete_progress(progress)
        except ValueError as error:
            raise HTTPException(status_code=409, detail=str(error)) from error
        await db.flush()
        return progress


@router.post("/progress/{progress_id}/reopen", response_model=ProgressRead)
async def reopen_completed_progress(
    progress_id: UUID, request: Request, tenant_id: Annotated[UUID, Header(alias="X-Tenant-ID")]
):
    async with learner_transaction(
        request, tenant_id=tenant_id, permission="learning:write:self"
    ) as (db, principal):
        progress = await _owned_progress(db, progress_id, principal.user_id, principal.tenant_id)
        try:
            reopen_progress(progress)
        except ValueError as error:
            raise HTTPException(status_code=409, detail=str(error)) from error
        await db.flush()
        return progress
