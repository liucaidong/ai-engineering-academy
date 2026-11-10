"""Publish a validated immutable course snapshot using a dedicated DB identity.

The publisher database URL must authenticate directly as academy_course_publisher.
The role is deliberately separate from the API runtime role and tenant roles.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import sys
from datetime import UTC, datetime
from pathlib import Path
from uuid import uuid4

from sqlalchemy import select, text
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.models import AuditEvent, CourseRelease
from app.schemas.course_release import course_snapshot_dict, validate_course_snapshot
from app.services.course_releases import (
    build_course_release,
    course_content_digest,
    publish_course_release,
)

PUBLISHER_ROLE = "academy_course_publisher"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--content", required=True, type=Path, help="Validated course JSON snapshot"
    )
    parser.add_argument("--course-key", required=True)
    parser.add_argument("--version", required=True)
    parser.add_argument("--schema-version", type=int, default=1)
    parser.add_argument(
        "--expected-sha256",
        help="Required for publication; must match the digest reviewed during dry-run",
    )
    parser.add_argument(
        "--dry-run", action="store_true", help="Validate and print digest without DB writes"
    )
    return parser.parse_args()


async def publish(args: argparse.Namespace, content: dict) -> dict:
    database_url = os.environ.get("ACADEMY_PUBLISHER_DATABASE_URL")
    if not database_url:
        raise RuntimeError(
            "ACADEMY_PUBLISHER_DATABASE_URL is required for a non-dry-run publication"
        )

    engine = create_async_engine(database_url, pool_pre_ping=True)
    try:
        factory = async_sessionmaker(engine, expire_on_commit=False, autoflush=False)
        async with factory() as session, session.begin():
            session_user, current_user = (
                await session.execute(text("SELECT session_user, current_user"))
            ).one()
            if session_user != PUBLISHER_ROLE or current_user != PUBLISHER_ROLE:
                raise PermissionError(
                    "Publisher connection must authenticate directly as "
                    f"{PUBLISHER_ROLE}; got session_user={session_user!r}, "
                    f"current_user={current_user!r}"
                )
            role = current_user

            revisions = list(
                (await session.execute(text("SELECT version_num FROM alembic_version"))).scalars()
            )
            if revisions != ["0012_platform_publisher_audit"]:
                raise RuntimeError(
                    "Publisher requires the exact database migration head "
                    "0012_platform_publisher_audit; "
                    f"found {revisions!r}"
                )

            release = build_course_release(
                course_key=args.course_key,
                version=args.version,
                schema_version=args.schema_version,
                content=content,
            )
            publish_course_release(release, published_at=datetime.now(UTC))
            # SQLAlchemy's Python-side column default is applied by ORM flush,
            # not by Core INSERT; assign the immutable release identity explicitly.
            release.id = uuid4()
            request_id = str(uuid4())
            inserted_id = (
                await session.execute(
                    pg_insert(CourseRelease)
                    .values(
                        id=release.id,
                        course_key=release.course_key,
                        version=release.version,
                        schema_version=release.schema_version,
                        content_sha256=release.content_sha256,
                        content=release.content,
                        status=release.status,
                        published_at=release.published_at,
                    )
                    .on_conflict_do_nothing(constraint="uq_course_releases_course_version")
                    .returning(CourseRelease.id)
                )
            ).scalar_one_or_none()

            existing = (
                await session.execute(
                    select(CourseRelease).where(
                        CourseRelease.course_key == release.course_key,
                        CourseRelease.version == args.version,
                    )
                )
            ).scalar_one_or_none()
            if existing is None:
                raise RuntimeError("Release insert conflicted but no existing release was found")

            if inserted_id is None:
                if (
                    existing.status != "published"
                    or existing.schema_version != args.schema_version
                    or existing.content_sha256 != release.content_sha256
                    or existing.content != release.content
                ):
                    raise RuntimeError(
                        "A release with this course_key/version already exists with different "
                        "content, schema, or lifecycle state; refusing to overwrite it"
                    )
                return {
                    "status": "already_published",
                    "release_id": str(existing.id),
                    "course_key": existing.course_key,
                    "version": existing.version,
                    "content_sha256": existing.content_sha256,
                }

            session.add(
                AuditEvent(
                    id=uuid4(),
                    actor_user_id=None,
                    tenant_id=None,
                    action="course_release.publish",
                    resource_type="course_release",
                    resource_id=str(existing.id),
                    request_id=request_id,
                    metadata_json={
                        "publisher_role": role,
                        "course_key": existing.course_key,
                        "version": existing.version,
                        "schema_version": existing.schema_version,
                        "content_sha256": existing.content_sha256,
                        "request_id": request_id,
                    },
                    # Explicit timestamp avoids ORM INSERT ... RETURNING on the
                    # audit table; the publisher role intentionally has no SELECT.
                    occurred_at=datetime.now(UTC),
                )
            )
            await session.flush()
            return {
                "status": "published",
                "release_id": str(existing.id),
                "course_key": existing.course_key,
                "version": existing.version,
                "schema_version": existing.schema_version,
                "content_sha256": existing.content_sha256,
                "request_id": request_id,
            }
    finally:
        await engine.dispose()


def main() -> int:
    args = parse_args()
    try:
        raw = json.loads(args.content.read_text(encoding="utf-8"))
        snapshot = validate_course_snapshot(raw)
        content = course_snapshot_dict(snapshot)
        if snapshot.version != args.version:
            raise ValueError(
                f"Snapshot version {snapshot.version!r} does not match requested release "
                f"version {args.version!r}"
            )
        release = build_course_release(
            course_key=args.course_key,
            version=args.version,
            schema_version=args.schema_version,
            content=content,
        )
        summary = {
            "status": "validated",
            "course_key": release.course_key,
            "version": release.version,
            "schema_version": release.schema_version,
            "content_sha256": course_content_digest(content),
            "modules": len(snapshot.modules),
            "lessons": sum(len(module.lessons) for module in snapshot.modules),
            "assessments": sum(
                len(lesson.assessments) for module in snapshot.modules for lesson in module.lessons
            ),
        }
        if args.dry_run:
            print(json.dumps(summary, ensure_ascii=False, indent=2))
            return 0
        if not args.expected_sha256:
            raise ValueError("--expected-sha256 is required for publication; run --dry-run first")
        if args.expected_sha256 != summary["content_sha256"]:
            raise ValueError(
                "content digest does not match --expected-sha256; refusing publication"
            )
        result = asyncio.run(publish(args, content))
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0
    except Exception as error:  # noqa: BLE001 - CLI boundary prints a concise failure and exits nonzero.
        print(f"course publication failed: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
