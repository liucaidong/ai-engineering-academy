"""Authenticated learner-facing reads for immutable published course snapshots."""

from datetime import datetime
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Header, HTTPException, Query, Request, Response
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select

from app.api.dependencies import learner_transaction
from app.models.course_release import CourseRelease

router = APIRouter(prefix="/courses/releases", tags=["course-releases"])


class CourseReleaseSummaryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    course_key: str
    version: str
    schema_version: int
    content_sha256: str
    published_at: datetime


class CourseReleaseRead(CourseReleaseSummaryRead):
    content: dict[str, Any]
    status: str
    created_at: datetime


@router.get("", response_model=list[CourseReleaseSummaryRead])
async def list_published_course_releases(
    request: Request,
    response: Response,
    tenant_id: UUID = Header(alias="X-Tenant-ID"),
    course_key: str | None = Query(default=None, min_length=1, max_length=80),
    limit: int = Query(default=50, ge=1, le=100),
):
    """List published catalog releases for a member of the selected tenant."""
    if course_key is not None and not course_key.strip():
        raise HTTPException(status_code=422, detail="course_key must not be blank")
    async with learner_transaction(request, tenant_id=tenant_id, permission="course:read") as (
        db,
        _principal,
    ):
        statement = select(CourseRelease).where(CourseRelease.status == "published")
        if course_key is not None:
            statement = statement.where(CourseRelease.course_key == course_key.strip())
        result = await db.execute(
            statement.order_by(CourseRelease.published_at.desc(), CourseRelease.id.asc()).limit(
                limit
            )
        )
        releases = list(result.scalars().all())

    response.headers["Cache-Control"] = "no-store"
    response.headers["Pragma"] = "no-cache"
    return [CourseReleaseSummaryRead.model_validate(release) for release in releases]


@router.get("/{release_id}", response_model=CourseReleaseRead)
async def get_course_release(
    release_id: UUID,
    request: Request,
    response: Response,
    tenant_id: UUID = Header(alias="X-Tenant-ID"),
):
    """Read an immutable published/retired snapshot; never expose drafts."""
    async with learner_transaction(request, tenant_id=tenant_id, permission="course:read") as (
        db,
        _principal,
    ):
        result = await db.execute(
            select(CourseRelease).where(
                CourseRelease.id == release_id,
                CourseRelease.status.in_(("published", "retired")),
            )
        )
        release = result.scalar_one_or_none()
        if release is None:
            raise HTTPException(status_code=404, detail="Published course release not found")

    response.headers["Cache-Control"] = "no-store"
    response.headers["Pragma"] = "no-cache"
    return CourseReleaseRead.model_validate(release)
