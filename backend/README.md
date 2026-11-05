# Backend foundation

FastAPI modular-monolith foundation. This slice intentionally provides only operational endpoints; it does not expose learner data or execute user code.

## Local development

Requires Python 3.11+.

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
python -m pip install -e ".[dev]"
uvicorn app.main:app --reload
```

- Liveness: `GET /health/live`
- Readiness: `GET /health/ready`
- OpenAPI: `/docs`

By default, local development does not require PostgreSQL. To require and probe PostgreSQL, set:

```bash
export ACADEMY_DATABASE_REQUIRED=true
export ACADEMY_DATABASE_URL='postgresql+asyncpg://academy:change-me@127.0.0.1:5432/academy'
```

The readiness endpoint then executes `SELECT 1` and returns HTTP 503 if the database is missing or unavailable. Never commit credentials or a populated `.env` file.

## Security boundary

No learner progress, assessment-result, tenant, account, model-provider or arbitrary-code-execution endpoints are present. Do not add them before the corresponding identity, authorization, audit and isolation contracts are implemented.

See [ADR 0001](../docs/adr/0001-backend-modular-monolith.md).
