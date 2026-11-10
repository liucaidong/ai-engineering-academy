#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXPECTED_PYTHON="$(tr -d '\n' < "$ROOT_DIR/.python-version")"
CONTAINER_NAME="aea-rls-acceptance-$$"
DATABASE_NAME="academy_rls_acceptance"
ADMIN_PASSWORD="$(python3 -c 'import secrets; print(secrets.token_hex(24))')"
RUNTIME_PASSWORD="$(python3 -c 'import secrets; print(secrets.token_hex(24))')"
CONTAINER_STARTED=0

cleanup() {
  if [[ "$CONTAINER_STARTED" == "1" ]]; then
    docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT INT TERM

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required for PostgreSQL RLS acceptance." >&2
  exit 1
fi
if ! command -v uv >/dev/null 2>&1; then
  echo "uv is required for PostgreSQL RLS acceptance." >&2
  exit 1
fi

echo "== Start disposable PostgreSQL 18 instance =="
docker run --detach --rm \
  --name "$CONTAINER_NAME" \
  --publish 127.0.0.1::5432 \
  --env "POSTGRES_USER=postgres" \
  --env "POSTGRES_PASSWORD=$ADMIN_PASSWORD" \
  --env "POSTGRES_DB=$DATABASE_NAME" \
  postgres:18-alpine >/dev/null
CONTAINER_STARTED=1

PORT="$(docker port "$CONTAINER_NAME" 5432/tcp | sed 's/.*://')"
READY=0
for _ in $(seq 1 60); do
  if docker exec "$CONTAINER_NAME" pg_isready -U postgres -d "$DATABASE_NAME" >/dev/null 2>&1; then
    READY=1
    break
  fi
  sleep 1
done
if [[ "$READY" != "1" ]]; then
  docker logs "$CONTAINER_NAME" >&2
  echo "Disposable PostgreSQL did not become ready." >&2
  exit 1
fi

export ACADEMY_DATABASE_URL="postgresql+asyncpg://postgres:${ADMIN_PASSWORD}@127.0.0.1:${PORT}/${DATABASE_NAME}"
export ACADEMY_TEST_ADMIN_DATABASE_URL="$ACADEMY_DATABASE_URL"
export ACADEMY_TEST_RUNTIME_DATABASE_URL="postgresql+asyncpg://academy_runtime:${RUNTIME_PASSWORD}@127.0.0.1:${PORT}/${DATABASE_NAME}"

cd "$ROOT_DIR/backend"

echo "== Apply the complete Alembic migration chain =="
uv run --locked --python "$EXPECTED_PYTHON" --default-index https://pypi.org/simple alembic upgrade head

echo "== Create a non-owner, non-superuser runtime role without BYPASSRLS =="
docker exec -i \
  --env "PGPASSWORD=$ADMIN_PASSWORD" \
  "$CONTAINER_NAME" \
  psql -h 127.0.0.1 -U postgres -d "$DATABASE_NAME" \
    -v ON_ERROR_STOP=1 -v "runtime_password=$RUNTIME_PASSWORD" <<'SQL'
CREATE ROLE academy_runtime
  LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS
  PASSWORD :'runtime_password';
GRANT CONNECT ON DATABASE academy_rls_acceptance TO academy_runtime;
GRANT USAGE ON SCHEMA public TO academy_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO academy_runtime;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO academy_runtime;
REVOKE INSERT, UPDATE, DELETE ON TABLE course_releases FROM academy_runtime;
GRANT SELECT ON TABLE course_releases TO academy_runtime;
SQL

echo "== Run real PostgreSQL RLS integration acceptance =="
uv run --locked --python "$EXPECTED_PYTHON" --default-index https://pypi.org/simple \
  pytest -q tests/integration/test_tenant_rls_postgres.py -ra

echo "== Verify runtime role security attributes and immutable release grants =="
docker exec \
  --env "PGPASSWORD=$ADMIN_PASSWORD" \
  "$CONTAINER_NAME" \
  psql -h 127.0.0.1 -U postgres -d "$DATABASE_NAME" -Atc \
    "SELECT rolname || ': superuser=' || rolsuper || ', bypassrls=' || rolbypassrls FROM pg_roles WHERE rolname='academy_runtime';"
RELEASE_GRANTS="$(docker exec \
  --env "PGPASSWORD=$ADMIN_PASSWORD" \
  "$CONTAINER_NAME" \
  psql -h 127.0.0.1 -U postgres -d "$DATABASE_NAME" -Atc \
  "SELECT has_table_privilege('academy_runtime', 'course_releases', 'SELECT') AND NOT has_table_privilege('academy_runtime', 'course_releases', 'INSERT') AND NOT has_table_privilege('academy_runtime', 'course_releases', 'UPDATE') AND NOT has_table_privilege('academy_runtime', 'course_releases', 'DELETE')")"
if [[ "$RELEASE_GRANTS" != "t" ]]; then
  echo "Runtime role has unexpected write access to immutable course releases." >&2
  exit 1
fi

echo "PostgreSQL RLS acceptance completed. The disposable database will now be removed."
