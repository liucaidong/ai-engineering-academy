# PostgreSQL RLS Integration Acceptance

## Purpose

This acceptance suite executes the application's actual Alembic migrations against a disposable PostgreSQL 18 server and runs the integration test using a separate runtime role. It is not a SQLite substitute, SQL-text assertion, or mocked database test.

## Run

From the repository root:

```bash
bash scripts/acceptance-postgres-rls.sh
```

Requirements:

- Docker Engine/Desktop running.
- `uv` installed.
- The Python version pinned in `.python-version` available through uv.
- The `postgres:18-alpine` image available locally or downloadable.

The script creates a uniquely named disposable container, binds its PostgreSQL port to localhost only, generates ephemeral credentials, applies all Alembic migrations, and creates `academy_runtime` with:

- `NOSUPERUSER`
- `NOBYPASSRLS`
- No database/schema ownership.
- Explicit DML grants so policy enforcement—not missing SQL privileges—is what controls row access.

The script runs the integration test and removes its container on exit. It does not connect to or mutate an existing project database. It does not print generated passwords or connection URLs.

## What is verified

The live PostgreSQL test verifies:

1. The runtime role is neither superuser nor `BYPASSRLS`.
2. The runtime role does not own protected tables.
3. All protected tables have both RLS enabled and FORCE RLS enabled, including OIDC login transactions.
4. Missing tenant/user context fails closed.
5. A user sees only their own active membership and authorized tenant rows.
6. A forged tenant context does not expose another tenant's learning progress or assessment records.
7. Cross-tenant UPDATE affects zero rows.
8. Cross-tenant INSERT is rejected by the RLS `WITH CHECK` policy.
9. Same-tenant learner INSERT and permitted UPDATE operations succeed.
10. DELETE remains denied for learner progress and assessment records because no DELETE policy is defined.
11. Suspended membership immediately removes tenant and learner-record visibility.
12. The narrowly scoped first-personal-tenant bootstrap path succeeds, while a mismatched bootstrap tenant is rejected.
13. Transaction-local identity and tenant settings do not leak when a pooled connection is reused after commit.

The protected table set currently includes `users`, `external_identities`, `auth_sessions`, `oidc_login_transactions`, `tenants`, `tenant_memberships`, `tenant_membership_roles`, `tenant_invitations`, `audit_events`, `learning_progress`, and `assessment_results`.

## Environment-variable mode

The integration test can also target an already provisioned, isolated test database by setting:

- `ACADEMY_TEST_ADMIN_DATABASE_URL`: test-only superuser or `BYPASSRLS` role used only for fixture setup/cleanup.
- `ACADEMY_TEST_RUNTIME_DATABASE_URL`: actual non-owner application role with neither superuser nor `BYPASSRLS`.

The target database must already be migrated to Alembic head. Do not point these variables at production or a shared development database. If either variable is missing, pytest reports the integration test as skipped; use the disposable-container script when a reproducible real-database result is required.

## Security boundary

RLS is a database enforcement layer, not a replacement for authentication. The application must derive `app.user_id` and `app.tenant_id` from a verified principal, set them transaction-locally, and never trust caller-supplied tenant identity. Runtime credentials must remain separate from migration/admin credentials. Do not grant the application role table ownership, superuser, or `BYPASSRLS`.
