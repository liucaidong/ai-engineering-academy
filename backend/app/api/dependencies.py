"""Authenticated tenant-scoped transaction dependency for learner APIs."""
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from uuid import UUID

from fastapi import HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.db.session import set_security_context, transaction_scope
from app.security.sessions import SESSION_COOKIE_NAME, resolve_session
from app.services.authorization import AuthorizationDenied, TenantPrincipal, load_tenant_principal, require_permission


@asynccontextmanager
async def learner_transaction(
    request: Request,
    *,
    tenant_id: UUID,
    permission: str,
) -> AsyncIterator[tuple[AsyncSession, TenantPrincipal]]:
    """Resolve cookie session and active membership before setting tenant RLS context."""
    settings = get_settings()
    if not settings.oidc_login_enabled or not settings.learner_data_api_enabled:
        raise HTTPException(status_code=503, detail="Learner data APIs are disabled")
    database = getattr(request.app.state, "database", None)
    if database is None:
        raise HTTPException(status_code=503, detail="Database is unavailable")
    try:
        await database.check_schema_revision("0009_assessment_self_grading_guard")
    except Exception as error:
        raise HTTPException(status_code=503, detail="Database migrations are not at the required revision") from error
    raw_token = request.cookies.get(SESSION_COOKIE_NAME)
    if not raw_token:
        raise HTTPException(status_code=401, detail="Authentication required")
    async with transaction_scope(database) as db:
        resolved = await resolve_session(db, raw_token)
        if resolved is None:
            raise HTTPException(status_code=401, detail="Session is invalid or expired")
        await set_security_context(db, user_id=resolved.user_id, tenant_id=tenant_id)
        principal = await load_tenant_principal(db, user_id=resolved.user_id, tenant_id=tenant_id)
        if principal is None:
            raise HTTPException(status_code=403, detail="Active tenant membership required")
        try:
            require_permission(principal, permission)
        except AuthorizationDenied as error:
            raise HTTPException(status_code=403, detail="Permission denied") from error
        yield db, principal
