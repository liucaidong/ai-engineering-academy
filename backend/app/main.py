"""HTTP application entry point.

Operational health endpoints are always available. OIDC routes are mounted
but return 503 until a complete provider/database/security configuration is
explicitly supplied through environment settings.
"""
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.assessments import router as assessments_router
from app.api.auth import router as auth_router
from app.api.learning import router as learning_router
from app.core.config import get_settings
from app.core.database import Database
from app.security.oidc_provider import OIDCVerifier
from app.security.request_protection import CSRFSecurityMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    settings = get_settings()
    database = Database(settings.sqlalchemy_database_url)
    app.state.database = database
    verifier = OIDCVerifier(settings.oidc_provider_config) if settings.oidc_login_enabled else None
    app.state.oidc_verifier = verifier
    try:
        yield
    finally:
        if verifier is not None:
            await verifier.aclose()
        await database.dispose()


settings = get_settings()
app = FastAPI(
    title="AI Engineering Academy API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url=None,
    lifespan=lifespan,
)
app.include_router(auth_router)
app.include_router(learning_router)
app.include_router(assessments_router)

if settings.oidc_login_enabled:
    app.add_middleware(
        CSRFSecurityMiddleware,
        allowed_origins=set(settings.oidc_allowed_origins),
        csrf_secret=settings.csrf_secret_value,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.oidc_allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type", "X-CSRF-Token"],
    )


@app.get("/health/live", tags=["health"])
async def liveness() -> dict[str, str]:
    """Report that the API process and event loop are responsive."""
    return {"status": "alive"}


@app.get("/health/ready", tags=["health"])
async def readiness(request: Request) -> JSONResponse:
    """Verify configured critical dependencies before accepting traffic."""
    if not settings.database_required:
        return JSONResponse(
            status_code=200,
            content={"status": "ready", "dependencies": {"database": "not-required"}},
        )

    database: Database = request.app.state.database
    try:
        await database.check()
        if settings.oidc_login_enabled:
            await database.check_schema_revision("0010_tenant_membership_discovery")
    except Exception:
        return JSONResponse(
            status_code=503,
            content={"status": "not-ready", "dependencies": {"database": "unavailable"}},
        )
    return JSONResponse(
        status_code=200,
        content={"status": "ready", "dependencies": {"database": "available"}},
    )
