"""Authenticated self-service tenant discovery for the current user."""

from collections.abc import Sequence
from typing import Literal
from uuid import UUID

from fastapi import APIRouter, HTTPException, Request, Response
from pydantic import BaseModel, ConfigDict
from sqlalchemy import and_, select
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import get_settings
from app.db.session import set_security_context, transaction_scope
from app.models.identity import Tenant, TenantMembership, TenantMembershipRole
from app.security.sessions import SESSION_COOKIE_NAME, resolve_session

router = APIRouter(prefix="/tenants", tags=["tenants"])


class TenantMembershipRead(BaseModel):
    model_config = ConfigDict(extra="forbid")

    tenant_id: UUID
    name: str
    tenant_type: Literal["personal", "organization"]
    roles: list[Literal["learner", "instructor", "tenant_admin"]]


async def _list_active_tenants(db, *, user_id: UUID) -> list[TenantMembershipRead]:
    """Discover own active memberships, then switch to each tenant's RLS context."""
    membership_result = await db.execute(
        select(TenantMembership.tenant_id)
        .where(
            TenantMembership.user_id == user_id,
            TenantMembership.status == "active",
        )
        .order_by(TenantMembership.created_at.asc(), TenantMembership.tenant_id.asc())
    )
    tenant_ids: Sequence[UUID] = membership_result.scalars().all()

    tenants: list[TenantMembershipRead] = []
    for tenant_id in tenant_ids:
        await set_security_context(db, user_id=user_id, tenant_id=tenant_id)
        result = await db.execute(
            select(Tenant.id, Tenant.name, Tenant.tenant_type, TenantMembershipRole.role)
            .select_from(TenantMembership)
            .join(Tenant, Tenant.id == TenantMembership.tenant_id)
            .outerjoin(
                TenantMembershipRole,
                and_(
                    TenantMembershipRole.tenant_id == TenantMembership.tenant_id,
                    TenantMembershipRole.membership_id == TenantMembership.id,
                ),
            )
            .where(
                TenantMembership.user_id == user_id,
                TenantMembership.tenant_id == tenant_id,
                TenantMembership.status == "active",
                Tenant.status == "active",
            )
        )
        rows = result.all()
        if not rows:
            # Membership or tenant may have been suspended between the discovery
            # query and this tenant-scoped read. Fail closed and omit the tenant.
            continue
        tenants.append(
            TenantMembershipRead(
                tenant_id=tenant_id,
                name=rows[0][1],
                tenant_type=rows[0][2],
                roles=sorted({row[3] for row in rows if row[3] is not None}),
            )
        )
    return tenants


@router.get("/me", response_model=list[TenantMembershipRead])
async def list_my_tenants(request: Request, response: Response) -> list[TenantMembershipRead]:
    """Return only active tenants and roles belonging to the current session user."""
    settings = get_settings()
    if not settings.oidc_login_enabled or not settings.learner_data_api_enabled:
        raise HTTPException(status_code=503, detail="Tenant discovery is disabled")

    database = getattr(request.app.state, "database", None)
    if database is None:
        raise HTTPException(status_code=503, detail="Database is unavailable")
    try:
        await database.check_schema_revision("0011_personal_tenant_bootstrap")
    except (SQLAlchemyError, RuntimeError, ValueError) as error:
        raise HTTPException(
            status_code=503,
            detail="Database migrations are not at the required revision",
        ) from error

    raw_token = request.cookies.get(SESSION_COOKIE_NAME)
    if not raw_token:
        raise HTTPException(status_code=401, detail="Authentication required")

    response.headers["Cache-Control"] = "no-store"
    response.headers["Pragma"] = "no-cache"
    async with transaction_scope(database) as db:
        resolved = await resolve_session(db, raw_token)
        if resolved is None:
            raise HTTPException(status_code=401, detail="Session is invalid or expired")
        tenants = await _list_active_tenants(db, user_id=resolved.user_id)

    return tenants
