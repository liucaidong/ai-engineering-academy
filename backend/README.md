# Backend foundation

FastAPI modular-monolith foundation. The current slice provides operational endpoints, PostgreSQL connectivity, async session/transaction primitives and the first versioned course-catalog schema. It does not expose learner data or execute user code.

## Local development

Requires Python 3.11+.

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
python -m pip install -e ".[dev]"
cp .env.example .env
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

The readiness endpoint then executes `SELECT 1` and returns HTTP 503 if the database is missing or unavailable. Never commit credentials or a populated `.env` file. Production settings require both `ACADEMY_DATABASE_REQUIRED=true` and a database URL.

## Database migrations

The initial migration creates `course_releases`, a versioned course-content snapshot table. Each course key/version pair is unique; schema versions must be positive; release status is constrained to `draft`, `published` or `retired`. A second migration enforces that drafts have no publication timestamp and published/retired releases do. JSONB stores the content snapshot, while SHA-256 records its canonical UTF-8 JSON digest. The domain service in `app/services/course_releases.py` builds draft snapshots and publishes them only after verifying the digest; persistence and commit remain the caller's responsibility. The service does not replace the frontend course-schema validator, and no public create/publish HTTP endpoint is exposed yet.

```bash
# With ACADEMY_DATABASE_URL set and PostgreSQL reachable:
alembic -c alembic.ini upgrade head

# Inspect migration state:
alembic -c alembic.ini current
alembic -c alembic.ini history
```

Run migration commands from the `backend/` directory. The URL is read from environment settings; the placeholder URL in `alembic.ini` is not a credential source.

## Session and transaction rules

- Use `session_scope(database)` for a session where the caller explicitly controls commit/rollback.
- Use `transaction_scope(database)` for a single atomic transaction that commits on successful exit and rolls back on exception.
- Do not share an `AsyncSession` across concurrent tasks.
- Keep database sessions short; do not hold a transaction open across network calls or user interaction.

## Security boundary

Identity and tenant tables now exist as dormant persistence foundations: users, OIDC external identities, hashed opaque-session tokens, tenants, memberships, tenant-scoped role grants, invitations and audit events. They are not wired to HTTP routes. OIDC callback validation, cookie issuance, CSRF protection, authorization services, transaction-local tenant context and PostgreSQL RLS are not implemented. Cross-tenant denial tests using a non-owner runtime database role are also pending; learner-data and tenant-management APIs must remain disabled until the ADR 0003 implementation gates are satisfied. Course release snapshots are catalog data, not learner-owned data. Arbitrary code execution is also absent.

See [ADR 0002](../docs/adr/0002-backend-modular-monolith.md) and [ADR 0003](../docs/adr/0003-identity-and-tenant-isolation.md).
