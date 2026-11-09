import httpx
import pytest

from app import main
from app.core.config import Settings


@pytest.mark.asyncio
async def test_liveness_reports_process_health() -> None:
    async with main.app.router.lifespan_context(main.app):
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=main.app), base_url="http://test"
        ) as client:
            response = await client.get("/health/live")

    assert response.status_code == 200
    assert response.json() == {"status": "alive"}


@pytest.mark.asyncio
async def test_readiness_allows_database_free_local_development(monkeypatch) -> None:
    monkeypatch.setattr(main, "get_settings", lambda: Settings(environment="development"))

    async with main.app.router.lifespan_context(main.app):
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=main.app), base_url="http://test"
        ) as client:
            response = await client.get("/health/ready")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ready",
        "dependencies": {"database": "not-required"},
    }


@pytest.mark.asyncio
async def test_readiness_fails_when_required_database_is_not_configured(monkeypatch) -> None:
    monkeypatch.setattr(
        main,
        "get_settings",
        lambda: Settings(environment="development", database_required=True),
    )

    async with main.app.router.lifespan_context(main.app):
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=main.app), base_url="http://test"
        ) as client:
            response = await client.get("/health/ready")

    assert response.status_code == 503
    assert response.json() == {
        "status": "not-ready",
        "dependencies": {"database": "unavailable"},
    }


def test_production_configuration_requires_database() -> None:
    try:
        Settings(environment="production")
    except ValueError as error:
        assert "Production requires" in str(error)
    else:
        raise AssertionError("Production settings must reject missing database configuration")
