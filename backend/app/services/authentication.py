from __future__ import annotations

from datetime import timedelta
from uuid import uuid4

from sqlalchemy.exc import IntegrityError

from app.core.database import Database
from app.db.session import transaction_scope
from app.security.sessions import create_session
from app.services.oidc_identity import resolve_or_provision_oidc_identity


async def provision_oidc_session(
    database: Database, *, claims: dict[str, object], session_ttl_seconds: int
) -> str:
    """Resolve an OIDC subject and issue a session in one application use case.

    A uniqueness race during first-login provisioning is retried only after the
    failed transaction has exited and rolled back. The retry uses a fresh unit
    of work so a failed SQLAlchemy transaction is never reused.
    """

    async def create_for_identity() -> str:
        async with transaction_scope(database) as db:
            identity = await resolve_or_provision_oidc_identity(
                db, claims=claims, request_id=uuid4().hex
            )
            _record, raw_token = await create_session(
                db,
                user_id=identity.user_id,
                ttl=timedelta(seconds=session_ttl_seconds),
            )
            return raw_token

    try:
        return await create_for_identity()
    except IntegrityError:
        return await create_for_identity()
