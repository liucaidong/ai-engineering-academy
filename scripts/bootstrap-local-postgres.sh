#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/backend/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE. Copy backend/.env.example and set unique local credentials first." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

required=(ACADEMY_DB_HOST ACADEMY_DB_PORT ACADEMY_DB_NAME ACADEMY_DB_ADMIN_USER ACADEMY_DB_ADMIN_PASSWORD ACADEMY_RUNTIME_PASSWORD ACADEMY_PUBLISHER_PASSWORD)
for name in "${required[@]}"; do
  if [[ -z "${!name:-}" ]]; then
    echo "$name must be set in backend/.env" >&2
    exit 1
  fi
done

case "$ACADEMY_DB_HOST" in
  localhost|127.0.0.1) ;;
  *) echo "This bootstrap script is local-only; ACADEMY_DB_HOST must be localhost or 127.0.0.1." >&2; exit 1 ;;
esac

if [[ "$ACADEMY_DB_ADMIN_PASSWORD" == "change-me" || "$ACADEMY_RUNTIME_PASSWORD" == "change-me" || "$ACADEMY_PUBLISHER_PASSWORD" == "change-me" ]]; then
  echo "Replace all change-me credentials with unique random values before continuing." >&2
  exit 1
fi

export PGHOST="$ACADEMY_DB_HOST"
export PGPORT="$ACADEMY_DB_PORT"
export PGDATABASE="$ACADEMY_DB_NAME"
export PGUSER="$ACADEMY_DB_ADMIN_USER"
export PGPASSWORD="$ACADEMY_DB_ADMIN_PASSWORD"

ADMIN_ASYNC_URL="$(python3 - <<'PYURL'
import os
from urllib.parse import quote

user = quote(os.environ["ACADEMY_DB_ADMIN_USER"], safe="")
password = quote(os.environ["ACADEMY_DB_ADMIN_PASSWORD"], safe="")
host = os.environ["ACADEMY_DB_HOST"]
port = os.environ["ACADEMY_DB_PORT"]
database = quote(os.environ["ACADEMY_DB_NAME"], safe="")
print(f"postgresql+asyncpg://{user}:{password}@{host}:{port}/{database}")
PYURL
)"

echo "== Apply Alembic migrations to the local PostgreSQL database =="
(
  cd "$ROOT_DIR/backend"
  ACADEMY_DATABASE_URL="$ADMIN_ASYNC_URL" ACADEMY_DATABASE_REQUIRED=true \
    uv run --locked --python 3.12.14 --default-index https://pypi.org/simple alembic upgrade head
)

REVISION="$(psql -X -v ON_ERROR_STOP=1 -Atc 'SELECT version_num FROM alembic_version')"
if [[ "$REVISION" != "0012_platform_publisher_audit" ]]; then
  echo "Expected migration head 0012_platform_publisher_audit, found: $REVISION" >&2
  exit 1
fi

echo "== Provision direct-login runtime and publisher roles =="
export ACADEMY_RUNTIME_PASSWORD ACADEMY_PUBLISHER_PASSWORD ACADEMY_DB_NAME ACADEMY_DB_ADMIN_USER
psql -X -v ON_ERROR_STOP=1 -f "$ROOT_DIR/backend/scripts/provision_local_roles.sql"

echo "== Verify role attributes and direct login =="
PGUSER=academy_runtime PGPASSWORD="$ACADEMY_RUNTIME_PASSWORD" \
  psql -X -v ON_ERROR_STOP=1 -Atc \
  "SELECT current_user || ':superuser=' || (SELECT rolsuper FROM pg_roles WHERE rolname=current_user) || ':bypassrls=' || (SELECT rolbypassrls FROM pg_roles WHERE rolname=current_user)"
PGUSER=academy_runtime PGPASSWORD="$ACADEMY_RUNTIME_PASSWORD" \
  psql -X -v ON_ERROR_STOP=1 -Atc 'SELECT version_num FROM alembic_version'
PGUSER=academy_course_publisher PGPASSWORD="$ACADEMY_PUBLISHER_PASSWORD" \
  psql -X -v ON_ERROR_STOP=1 -Atc \
  "SELECT current_user || ':superuser=' || (SELECT rolsuper FROM pg_roles WHERE rolname=current_user) || ':bypassrls=' || (SELECT rolbypassrls FROM pg_roles WHERE rolname=current_user)"
PGUSER=academy_course_publisher PGPASSWORD="$ACADEMY_PUBLISHER_PASSWORD" \
  psql -X -v ON_ERROR_STOP=1 -Atc 'SELECT version_num FROM alembic_version'

ROLE_CHECK="$(psql -X -v ON_ERROR_STOP=1 -Atc "
  SELECT
    (SELECT count(*) = 0 FROM pg_auth_members WHERE member IN ('academy_runtime'::regrole, 'academy_course_publisher'::regrole))
    AND (SELECT count(*) = 0 FROM pg_class WHERE relkind IN ('r','p','S') AND relowner IN ('academy_runtime'::regrole, 'academy_course_publisher'::regrole))
    AND has_table_privilege('academy_course_publisher', 'course_releases', 'SELECT')
    AND has_table_privilege('academy_course_publisher', 'course_releases', 'INSERT')
    AND NOT has_table_privilege('academy_course_publisher', 'course_releases', 'UPDATE')
    AND NOT has_table_privilege('academy_course_publisher', 'course_releases', 'DELETE')
    AND has_table_privilege('academy_course_publisher', 'audit_events', 'INSERT')
    AND NOT has_table_privilege('academy_course_publisher', 'audit_events', 'UPDATE')
    AND has_table_privilege('academy_course_publisher', 'tenant_memberships', 'SELECT')
    AND has_table_privilege('academy_course_publisher', 'alembic_version', 'SELECT')
    AND NOT has_table_privilege('academy_course_publisher', 'alembic_version', 'UPDATE')
    AND has_table_privilege('academy_runtime', 'alembic_version', 'SELECT')
")"
if [[ "$ROLE_CHECK" != "t" ]]; then
  echo "Runtime/publisher ownership or least-privilege verification failed." >&2
  exit 1
fi

echo "Local PostgreSQL schema and roles are ready. Learner APIs remain disabled by default."
