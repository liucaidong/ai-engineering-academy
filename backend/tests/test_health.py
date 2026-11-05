from fastapi.testclient import TestClient

from app import main
from app.core.config import Settings


def test_liveness_reports_process_health() -> None:
    with TestClient(main.app) as client:
        response = client.get("/health/live")

    assert response.status_code == 200
    assert response.json() == {"status": "alive"}


def test_readiness_allows_database_free_local_development(monkeypatch) -> None:
    monkeypatch.setattr(main, "get_settings", lambda: Settings(environment="development"))

    with TestClient(main.app) as client:
        response = client.get("/health/ready")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ready",
        "dependencies": {"database": "not-required"},
    }


def test_readiness_fails_when_required_database_is_not_configured(monkeypatch) -> None:
    monkeypatch.setattr(
        main,
        "get_settings",
        lambda: Settings(environment="development", database_required=True),
    )

    with TestClient(main.app) as client:
        response = client.get("/health/ready")

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
