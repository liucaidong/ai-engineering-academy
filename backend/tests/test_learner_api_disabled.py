import httpx
import pytest
from fastapi import FastAPI

from app.api import assessments, learning
from app.core.config import Settings


@pytest.mark.asyncio
async def test_learner_data_routes_are_disabled_by_default(monkeypatch):
    from app.api import dependencies

    monkeypatch.setattr(dependencies, "get_settings", lambda: Settings(_env_file=None))
    app = FastAPI()
    app.include_router(learning.router)
    app.include_router(assessments.router)
    tenant = "00000000-0000-0000-0000-000000000001"
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app),
        base_url="https://academy.example.test",
    ) as client:
        responses = [
            await client.get("/learning/progress", headers={"X-Tenant-ID": tenant}),
            await client.get("/assessments/attempts", headers={"X-Tenant-ID": tenant}),
            await client.post(
                "/assessments/attempts",
                headers={"X-Tenant-ID": tenant},
                json={
                    "course_release_id": "00000000-0000-0000-0000-000000000002",
                    "assessment_key": "M01-L01-A01",
                },
            ),
        ]
    assert [response.status_code for response in responses] == [503, 503, 503]
