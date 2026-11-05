# Backend foundation

FastAPI modular-monolith foundation. The current slice provides operational endpoints, PostgreSQL connectivity, async session/transaction primitives, eight Alembic migrations, versioned course releases, identity/tenant schemas, owner-scoped learner records, forced RLS policies and domain lifecycle services. It does not expose account, tenant-management or learner-data HTTP routes, and it does not execute user code.

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

The first two migrations create `course_releases` and enforce its publication lifecycle. The third migration adds dormant user, OIDC identity, session, tenant, membership, role, invitation and audit tables. The fourth migration enables and forces row-level security on identity and tenant tables. The fifth migration adds tenant/user/course-release-scoped learning progress and assessment attempts, then applies owner-only RLS policies to both learner tables. The sixth adds the exact-token-hash bootstrap policy required to resolve a session before `app.user_id` is known. The seventh adds short-lived OIDC login transactions protected by a one-time state-hash RLS context. The eighth adds exact issuer/subject bootstrap lookup and constrained first-login personal-tenant provisioning policies. Pure domain services implement progress start/complete/reopen and assessment draft/submit/grade transitions with JSON and timestamp validation. Each course key/version pair is unique; schema versions must be positive; release status is constrained to `draft`, `published` or `retired`. A second migration enforces that drafts have no publication timestamp and published/retired releases do. JSONB stores the content snapshot, while SHA-256 records its canonical UTF-8 JSON digest. The domain service in `app/services/course_releases.py` builds draft snapshots and publishes them only after verifying the digest; persistence and commit remain the caller's responsibility. The service does not replace the frontend course-schema validator, and no public create/publish HTTP endpoint is exposed yet.

```bash
# With ACADEMY_DATABASE_URL set and PostgreSQL reachable:
alembic -c alembic.ini upgrade head

# Inspect migration state:
alembic -c alembic.ini current
alembic -c alembic.ini history
```

Run migration commands from the `backend/` directory. The URL is read from environment settings; the placeholder URL in `alembic.ini` is not a credential source. Run migrations with a schema-owner/migrator role; the API must connect with a separate non-owner role that is neither superuser nor `BYPASSRLS` and has only the required table privileges.

## Session and transaction rules

- Use `session_scope(database)` for a session where the caller explicitly controls commit/rollback.
- Use `transaction_scope(database)` for a single atomic transaction that commits on successful exit and rolls back on exception.
- Use `authenticated_transaction_scope(database, user_id=..., tenant_id=...)` for authenticated tenant-scoped work; it sets RLS context before yielding the session.
- For initial cookie resolution, use `transaction_scope(database)` and call `resolve_session(...)`; it temporarily sets only the token-hash bootstrap context, resolves one session row, then switches to the resolved user context. Do not query `auth_sessions` before calling this service.
- If managing the transaction manually, call `set_security_context(...)` only after the server has validated the session and active tenant membership.
- Never pass client-supplied user IDs or unchecked tenant IDs directly into the RLS context helper.
- Do not share an `AsyncSession` across concurrent tasks.
- Keep database sessions short; do not hold a transaction open across network calls or user interaction.

## Security boundary

Identity and tenant tables now exist as dormant persistence foundations: users, OIDC external identities, hashed opaque-session tokens, tenants, memberships, tenant-scoped role grants, invitations and audit events. They are not wired to HTTP routes. Provider-neutral opaque-session hashing, CSRF HMAC, OIDC state/nonce and PKCE S256 primitives are implemented. The OIDC provider adapter performs HTTPS-only discovery, exact issuer matching, cached JWKS retrieval with unknown-kid refresh, algorithm allowlisting and ID-token signature/issuer/audience/expiry/issued-at/subject/nonce/azp validation. Session create/resolve/revoke/rotate services, HttpOnly cookie helpers, opt-in CSRF/Origin middleware and active-membership/default-deny role authorization services are implemented but not wired to routes. A narrow token-hash RLS bootstrap policy enables session lookup before user identity is known, then the transaction switches to user context. Authorization-code exchange with PKCE and durable one-time login-transaction storage (hashed state/nonce plus Fernet-encrypted verifier) are implemented as provider-neutral services. Callback/session HTTP routes, production origin/provider configuration and resource-scoped instructor access remain pending. The OIDC identity service can resolve existing issuer/subject pairs or provision a learner-only personal workspace; it is not exposed through HTTP. No sign-in endpoint is enabled. Migration `0004_tenant_rls` enables and forces RLS on identity/tenant tables; each database transaction must call `set_security_context(session, user_id=..., tenant_id=...)` before scoped queries. This helper sets transaction-local PostgreSQL settings so pooled connections cannot retain a previous request's context. RLS integration acceptance with a non-owner runtime role is authored but has not been executed. Learner records are currently owner-only under RLS; instructor review visibility and write services are not implemented; learner-data and tenant-management APIs must remain disabled until the ADR 0003 implementation gates are satisfied. Course release snapshots are catalog data, not learner-owned data. Arbitrary code execution is also absent.

See [ADR 0002](../docs/adr/0002-backend-modular-monolith.md) and [ADR 0003](../docs/adr/0003-identity-and-tenant-isolation.md).


## RLS integration acceptance

The optional integration test uses two separately provisioned PostgreSQL connections:

- `ACADEMY_TEST_ADMIN_DATABASE_URL`: test-only superuser or `BYPASSRLS` role used only to seed and clean fixtures;
- `ACADEMY_TEST_RUNTIME_DATABASE_URL`: the actual application-style non-owner role, with required table grants but without superuser or `BYPASSRLS`.

After applying all migrations, run from `backend/`:

```bash
ACADEMY_TEST_ADMIN_DATABASE_URL='postgresql+asyncpg://...' \
ACADEMY_TEST_RUNTIME_DATABASE_URL='postgresql+asyncpg://...' \
pytest -q tests/integration/test_tenant_rls_postgres.py
```

The test seeds two users in the same tenant plus a user in a second tenant. It verifies that a non-owner runtime role sees only the current user's membership and learner records, cannot update another learner's progress or assessment attempt in the same tenant, receives no rows when the user/tenant context is mismatched, and receives no tenant rows when context is absent. It skips when the two test-only URLs are not configured. Never use production credentials for this test.
