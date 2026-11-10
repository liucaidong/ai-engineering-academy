# Backend foundation

FastAPI modular-monolith foundation. The current slice provides operational endpoints, PostgreSQL connectivity, async session/transaction primitives, twelve Alembic migrations, versioned course releases, identity/tenant schemas, OIDC sign-in/session routes (disabled until configured), owner-scoped learner records, forced RLS policies and domain lifecycle services. General account-management and tenant-management routes are not exposed. Authenticated course-release reads, learner progress and assessment routes are mounted but return HTTP 503 by default; explicit activation requires complete OIDC configuration, PostgreSQL RLS acceptance and privacy/retention review. The backend does not execute user code.

## Local development

Requires Python 3.12 as the standard development version (supported range is declared in `pyproject.toml`). Dependencies are locked with uv.

```bash
uv sync --locked --default-index https://pypi.org/simple --extra dev
uv run --locked --default-index https://pypi.org/simple ruff format --check app migrations tests scripts
uv run --locked --default-index https://pypi.org/simple ruff check app migrations tests scripts
uv run --locked --default-index https://pypi.org/simple pytest -q
cp .env.example .env
uv run --locked --default-index https://pypi.org/simple uvicorn app.main:app --reload
```

- Liveness: `GET /health/live`
- Readiness: `GET /health/ready`
- OpenAPI: `/docs`
- OpenAPI contract export: run `pnpm api:generate` from the repository root; verify drift with `pnpm api:check`.

By default, local development does not require PostgreSQL. To require and probe PostgreSQL, set:

```bash
export ACADEMY_DATABASE_REQUIRED=true
export ACADEMY_DATABASE_URL='postgresql+asyncpg://academy:change-me@127.0.0.1:5432/academy'
```

The readiness endpoint then executes `SELECT 1` and returns HTTP 503 if the database is missing or unavailable. Never commit credentials or a populated `.env` file. Production settings require both `ACADEMY_DATABASE_REQUIRED=true` and a database URL.

## Database migrations

The first two migrations create `course_releases` and enforce its publication lifecycle. The third migration adds dormant user, OIDC identity, session, tenant, membership, role, invitation and audit tables. The fourth migration enables and forces row-level security on identity and tenant tables. The fifth migration adds tenant/user/course-release-scoped learning progress and assessment attempts, then applies owner-only RLS policies to both learner tables. The sixth adds the exact-token-hash bootstrap policy required to resolve a session before `app.user_id` is known. The seventh adds short-lived OIDC login transactions protected by a one-time state-hash RLS context. The eighth adds exact issuer/subject bootstrap lookup and constrained first-login personal-tenant provisioning policies. Pure domain services implement progress start/complete/reopen and assessment draft/submit/grade transitions with JSON and timestamp validation. Migration 0009 adds a database trigger that prevents learner-owned assessment attempts from being self-graded or having their identity fields changed. Each course key/version pair is unique; schema versions must be positive; release status is constrained to `draft`, `published` or `retired`. A second migration enforces that drafts have no publication timestamp and published/retired releases do. JSONB stores the content snapshot, while SHA-256 records its canonical UTF-8 JSON digest. The domain service in `app/services/course_releases.py` builds draft snapshots and publishes them only after verifying the digest; persistence and commit remain the caller's responsibility. The service does not replace the frontend course-schema validator. Authenticated learner-facing reads expose published release metadata and published/retired immutable snapshots through `/courses/releases`; drafts remain hidden. Global catalog publishing remains a platform-scoped operator workflow, not a tenant-admin permission, and no create/publish HTTP endpoint is exposed.

```bash
# With ACADEMY_DATABASE_URL set and PostgreSQL reachable:
uv run --locked --default-index https://pypi.org/simple alembic -c alembic.ini upgrade head

# Inspect migration state:
uv run --locked --default-index https://pypi.org/simple alembic -c alembic.ini current
uv run --locked --default-index https://pypi.org/simple alembic -c alembic.ini history
```

Run migration commands from the `backend/` directory. The URL is read from environment settings; the placeholder URL in `alembic.ini` is not a credential source. Run migrations with a schema-owner/migrator role; the API must connect with a separate non-owner role that is neither superuser nor `BYPASSRLS` and has only the required table privileges. When OIDC is enabled, grant that role `SELECT` on `alembic_version` so the API can fail closed unless the database head is `0012_platform_publisher_audit`, the current schema revision required by both OIDC and learner API code.

## Session and transaction rules

- Use `session_scope(database)` for a session where the caller explicitly controls commit/rollback.
- Use `transaction_scope(database)` for a single atomic transaction that commits on successful exit and rolls back on exception.
- Use `authenticated_transaction_scope(database, user_id=..., tenant_id=...)` for authenticated tenant-scoped work; it sets RLS context before yielding the session.
- For initial cookie resolution, use `transaction_scope(database)` and call `resolve_session(...)`; it temporarily sets only the token-hash bootstrap context, resolves one session row, then switches to the resolved user context. Do not query `auth_sessions` before calling this service.
- If managing the transaction manually, call `set_security_context(...)` only after the server has validated the session and active tenant membership.
- Never pass client-supplied user IDs or unchecked tenant IDs directly into the RLS context helper.
- Do not share an `AsyncSession` across concurrent tasks.
- Keep database sessions short; do not hold a transaction open across network calls or user interaction.

## OIDC activation

OIDC endpoints are mounted but return HTTP 503 until all required environment settings are supplied. See `.env.example` for the variable names. The database must be enabled, the issuer/client/callback must match the provider registration, the Fernet key must be generated and stored outside source control, the CSRF secret must be at least 32 bytes, and the post-login URL origin must appear in the exact HTTPS origin allowlist. The frontend and API must be deployed on the same site for the current `SameSite=Lax` cookie policy. Use `GET /auth/login`, then `GET /auth/me`; fetch `GET /auth/csrf` to obtain the session-bound token for `X-CSRF-Token`, and use `POST /auth/logout` to revoke the session. When learner-data APIs are enabled, `GET /tenants/me` returns only the current session user’s active tenant memberships and database-assigned roles; it does not accept a user ID or tenant ID from the caller. Credentialed CORS and CSRF Origin checks are enabled only when OIDC is fully configured.

## Security boundary

Identity and tenant tables support the limited OIDC sign-in and first-login provisioning flow. General account-management and tenant-management routes are not exposed. Self-scoped learner progress and assessment-attempt routes are mounted but disabled by default. Provider-neutral opaque-session hashing, CSRF HMAC, OIDC state/nonce and PKCE S256 primitives are implemented. The browser-bound state cookie uses the `__Host-` prefix, Secure, HttpOnly and SameSite=Lax attributes to mitigate login CSRF. The OIDC provider adapter performs HTTPS-only discovery, exact issuer matching, cached JWKS retrieval with unknown-kid refresh, algorithm allowlisting and ID-token signature/issuer/audience/expiry/issued-at/subject/nonce/azp validation. Session create/resolve/revoke/rotate services, HttpOnly cookie helpers, opt-in CSRF/Origin middleware and active-membership/default-deny role authorization services are implemented; the OIDC routes use the authentication and provisioning subset. A narrow token-hash RLS bootstrap policy enables session lookup before user identity is known, then the transaction switches to user context. Authorization-code exchange with PKCE and durable one-time login-transaction storage (hashed state/nonce plus Fernet-encrypted verifier) are implemented as provider-neutral services. OIDC routes now provide login, callback, current-session, CSRF-token and logout flows, but remain disabled until the complete provider/database/security configuration is supplied. The API caches provider discovery/JWKS for its lifespan, validates ID tokens before provisioning a learner-only personal workspace, and issues opaque Secure/HttpOnly session cookies. Production provider registration, secret provisioning, same-site frontend/API deployment validation and resource-scoped instructor access remain deployment gates. Learner-data APIs require `ACADEMY_LEARNER_DATA_API_ENABLED=true`, complete OIDC configuration and migration head `0012_platform_publisher_audit`; they remain disabled by default until non-owner PostgreSQL RLS acceptance and privacy review pass. Tenant-management APIs remain disabled. Migration 0010 adds a narrow self-only active-membership discovery policy, allowing the signed-in user to select their own tenant IDs before setting a tenant context. Migration 0011 adds an exact-owner, exact-tenant, transaction-local bootstrap visibility policy used only while first-login provisioning inserts the first active personal membership; the application clears this marker immediately after the insert, and normal tenant discovery continues to require active membership. Migration `0004_tenant_rls` enables and forces RLS on identity/tenant tables; each database transaction must call `set_security_context(session, user_id=..., tenant_id=...)` before scoped queries. This helper sets transaction-local PostgreSQL settings so pooled connections cannot retain a previous request's context. A local PostgreSQL RLS acceptance was executed against a non-owner, non-BYPASSRLS runtime role, including first-login personal-tenant bootstrap, exact-marker rejection, tenant isolation, active-membership suspension and assessment self-grading rejection. The pytest integration harness remains available for repeatable execution when separate admin/runtime database URLs are supplied. Learner records are currently owner-only under RLS; instructor review visibility and write services are not implemented; learner APIs remain disabled by default until the ADR 0003 implementation gates are satisfied. Course release snapshots are catalog data, not learner-owned data. Arbitrary code execution is also absent.

See [ADR 0002](../docs/adr/0002-backend-modular-monolith.md) and [ADR 0003](../docs/adr/0003-identity-and-tenant-isolation.md).

## RLS integration acceptance

For a reproducible real-database run, execute the repository-root script:

```bash
bash scripts/acceptance-postgres-rls.sh
```

It starts an isolated disposable PostgreSQL 18 container, applies the full Alembic migration chain, provisions a non-owner runtime role without `BYPASSRLS`, runs the integration test, and removes the container. See [PostgreSQL RLS Integration Acceptance](../docs/POSTGRES_RLS_ACCEPTANCE.md) for the security boundary and coverage.

The integration test can also target a separately provisioned PostgreSQL database using two connections:

- `ACADEMY_TEST_ADMIN_DATABASE_URL`: test-only superuser or `BYPASSRLS` role used only to seed and clean fixtures;
- `ACADEMY_TEST_RUNTIME_DATABASE_URL`: the actual application-style non-owner role, with required table grants but without superuser or `BYPASSRLS`.

After applying all migrations, run from `backend/`:

```bash
ACADEMY_TEST_ADMIN_DATABASE_URL='postgresql+asyncpg://...' \
ACADEMY_TEST_RUNTIME_DATABASE_URL='postgresql+asyncpg://...' \
uv run --locked --default-index https://pypi.org/simple pytest -q tests/integration/test_tenant_rls_postgres.py
```

The test seeds two users in the same tenant plus a user in a second tenant. It verifies that a non-owner runtime role sees only the current user's membership and learner records, cannot update another learner's progress or assessment attempt in the same tenant, receives no rows when the user/tenant context is mismatched, and receives no tenant rows when context is absent. It skips when the two test-only URLs are not configured. Never use production credentials for this test.


## Platform course publication

Global course releases are published only through the dedicated
`academy_course_publisher` PostgreSQL login, not through learner sessions or
`tenant_admin` permissions. Apply Alembic through
`0012_platform_publisher_audit`, then have a database administrator
create the login role and apply the least-privilege grants in
`backend/scripts/provision_course_publisher_role.sql`. The role must be
`NOSUPERUSER`, `NOBYPASSRLS`, `NOINHERIT`, and must not be granted membership
in any other role. It receives SELECT/INSERT on `course_releases` and
INSERT on `audit_events`; SELECT on `alembic_version` is limited to checking
that the database is exactly at migration head `0012_platform_publisher_audit`.
It cannot modify migration state or update/delete published snapshots. It also receives SELECT on
`tenant_memberships` only because the existing tenant-user audit insert policy
contains an EXISTS subquery; migration 0012 adds a restrictive RLS policy
that makes this role see zero membership rows even if it sets custom GUC
values. The database trigger prevents publisher draft inserts and
published/retired snapshot mutation or deletion.

Export the complete frontend curriculum through Vite's SSR loader, which uses
the same Zod schema as the application:

```bash
node scripts/export-course-release.mjs /tmp/course-release.json
```

Validate and obtain the SHA-256 digest before publication:

```bash
cd backend
PYTHONPATH=. uv run --locked --python 3.12.14 --default-index https://pypi.org/simple \
  python scripts/publish_course_release.py \
  --content /tmp/course-release.json \
  --course-key ai-engineering-foundations \
  --version 0.40.9 --schema-version 1 --dry-run
```

After reviewing the digest, set `ACADEMY_PUBLISHER_DATABASE_URL` to the
dedicated role's connection string and repeat the command with
`--expected-sha256 <reviewed-digest>` and without `--dry-run`. The command
checks both `session_user` and `current_user`, validates the full strict
snapshot again, inserts the published immutable release and its global audit
event in one transaction, and uses the unique course/version constraint for
concurrency-safe idempotency. A repeat with identical content is a no-op; a
different digest, schema or lifecycle state is rejected. Never use the API
runtime or a tenant-admin credential for this operation. The disposable
PostgreSQL end-to-end publisher acceptance can be run with
pnpm acceptance:course-publisher; it does not publish to a persistent or
production database.


## Local persistent PostgreSQL setup

The application runtime must connect as `academy_runtime`, never as the schema owner or a superuser. The publisher CLI must connect directly as `academy_course_publisher`. A local PostgreSQL server/database must already be running and reachable on loopback. The standard local setup uses a dedicated persistent PostgreSQL 18 container named `aea-local-postgres`, loopback port `5433`, and Docker volume `aea-local-postgres-data`; it does not reuse the separate disposable acceptance container or any unrelated project database.

1. Copy `backend/.env.example` to `backend/.env`. Set `ACADEMY_DB_HOST=127.0.0.1`, the actual local port/database, and generate three independent 32-byte hex passwords (admin, runtime, publisher) using `python -c "import secrets; print(secrets.token_hex(32))"`. Update both role URLs with their matching passwords. Keep `ACADEMY_LEARNER_DATA_API_ENABLED=false`.
2. If the host does not have `psql`, set `ACADEMY_DB_PSQL_CONTAINER=aea-local-postgres`; the bootstrap script will use `docker exec` and copy the provisioning SQL into the container. Run `bash scripts/bootstrap-local-postgres.sh`. The script refuses non-loopback targets, applies Alembic migrations as the admin role, requires the single head `0012_platform_publisher_audit`, provisions direct-login least-privilege roles, removes role memberships and verifies both roles are non-superuser/non-BYPASSRLS. The runtime role has read-only access to immutable `course_releases`; only the publisher can insert a release.
3. Keep `backend/.env` untracked and permission-restricted (`chmod 600 backend/.env`). Never copy local credentials into source control, shell history or issue reports.
4. Run `bash scripts/publish-local-course-release.sh`. The first invocation exports the exact current curriculum, validates it and prints the SHA-256 without writing to the database. Review the course summary and digest, then rerun with `ACADEMY_EXPECTED_COURSE_SHA256=<reviewed digest>` to publish. The publisher URL is not the runtime URL.

The dedicated local database persists across container restarts. Use `docker stop aea-local-postgres` and `docker start aea-local-postgres` to stop/start it; do not remove its named data volume if you want to preserve the release. The local runtime URL is already configured in the ignored `backend/.env`; the API can be started from `backend/` with `uv run uvicorn app.main:app --reload`.

This helper is local-development only and rejects remote database hosts. It does not configure an OIDC provider, approve privacy/retention, or enable learner APIs.
