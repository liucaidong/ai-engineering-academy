"""HTTP application entry point.

This service deliberately exposes operational endpoints only. Learner data APIs
must not be added until identity, authorization, ownership and audit contracts
have been implemented.
"""
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.core.database import Database


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    settings = get_settings()
    database = Database(settings.sqlalchemy_database_url)
    app.state.database = database
    try:
        yield
    finally:
        await database.dispose()


app = FastAPI(
    title="AI Engineering Academy API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url=None,
    lifespan=lifespan,
)


@app.get("/health/live", tags=["health"])
async def liveness() -> dict[str, str]:
    """Report that the API process and event loop are responsive."""
    return {"status": "alive"}


@app.get("/health/ready", tags=["health"])
async def readiness(request: Request) -> JSONResponse:
    """Verify configured critical dependencies before accepting traffic."""
    settings = get_settings()
    if not settings.database_required:
        return JSONResponse(
            status_code=200,
            content={"status": "ready", "dependencies": {"database": "not-required"}},
        )

    database: Database = request.app.state.database
    try:
        await database.check()
    except Exception:
        return JSONResponse(
            status_code=503,
            content={"status": "not-ready", "dependencies": {"database": "unavailable"}},
        )
    return JSONResponse(
        status_code=200,
        content={"status": "ready", "dependencies": {"database": "available"}},
    )
