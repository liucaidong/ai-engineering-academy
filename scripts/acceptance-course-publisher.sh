#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXPECTED_PYTHON="$(tr -d '\n' < "$ROOT_DIR/.python-version")"
CONTAINER_NAME="aea-publisher-acceptance-$$"
DATABASE_NAME="academy_publisher_acceptance"
ADMIN_PASSWORD="$(python3 -c 'import secrets; print(secrets.token_hex(24))')"
PUBLISHER_PASSWORD="$(python3 -c 'import secrets; print(secrets.token_hex(24))')"
CONTAINER_STARTED=0
TEMP_DIR="$(mktemp -d)"

cleanup() {
  rm -rf "$TEMP_DIR"
  if [[ "$CONTAINER_STARTED" == "1" ]]; then
    docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT INT TERM

for command in docker uv node; do
  if ! command -v "$command" >/dev/null 2>&1; then
    echo "$command is required for course publisher acceptance." >&2
    exit 1
  fi
done

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
export ACADEMY_PUBLISHER_DATABASE_URL="postgresql+asyncpg://academy_course_publisher:${PUBLISHER_PASSWORD}@127.0.0.1:${PORT}/${DATABASE_NAME}"

cd "$ROOT_DIR/backend"
echo "== Apply complete migration chain =="
uv run --locked --python "$EXPECTED_PYTHON" --default-index https://pypi.org/simple alembic upgrade head

echo "== Provision isolated non-superuser publisher role =="
docker exec -i --env "PGPASSWORD=$ADMIN_PASSWORD" "$CONTAINER_NAME" \
  psql -h 127.0.0.1 -U postgres -d "$DATABASE_NAME" -v ON_ERROR_STOP=1 \
  -v "publisher_password=$PUBLISHER_PASSWORD" <<'SQL'
CREATE ROLE academy_course_publisher
  LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS
  PASSWORD :'publisher_password';
GRANT CONNECT ON DATABASE academy_publisher_acceptance TO academy_course_publisher;
GRANT USAGE ON SCHEMA public TO academy_course_publisher;
GRANT SELECT, INSERT ON TABLE course_releases TO academy_course_publisher;
GRANT INSERT ON TABLE audit_events TO academy_course_publisher;
GRANT SELECT ON TABLE tenant_memberships TO academy_course_publisher;
GRANT SELECT ON TABLE alembic_version TO academy_course_publisher;
INSERT INTO users (id, status) VALUES
  ('00000000-0000-4000-8000-000000000001', 'active');
INSERT INTO tenants (id, tenant_type, name, status, personal_owner_user_id) VALUES
  ('00000000-0000-4000-8000-000000000002', 'personal', 'Publisher RLS fixture', 'active',
   '00000000-0000-4000-8000-000000000001');
INSERT INTO tenant_memberships (id, tenant_id, user_id, status) VALUES
  ('00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000002',
   '00000000-0000-4000-8000-000000000001', 'active');
SQL

echo "== Verify publisher cannot discover tenant rows despite forged custom GUC values =="
MEMBERSHIP_ROWS="$(docker exec --env "PGPASSWORD=$PUBLISHER_PASSWORD" "$CONTAINER_NAME"   psql -h 127.0.0.1 -U academy_course_publisher -d "$DATABASE_NAME" -At   -c "SELECT set_config('app.user_id', '00000000-0000-4000-8000-000000000001', false); SELECT count(*) FROM tenant_memberships" | tail -n 1)"
if [[ "$MEMBERSHIP_ROWS" != "0" ]]; then
  echo "Publisher unexpectedly read tenant membership rows: $MEMBERSHIP_ROWS" >&2
  exit 1
fi

cd "$ROOT_DIR"
echo "== Export the exact complete frontend curriculum through the Zod schema =="
node scripts/export-course-release.mjs "$TEMP_DIR/course.json"

cd "$ROOT_DIR/backend"
echo "== Validate the course snapshot and obtain the reviewed digest =="
uv run --locked --python "$EXPECTED_PYTHON" --default-index https://pypi.org/simple \
  python scripts/publish_course_release.py \
  --content "$TEMP_DIR/course.json" \
  --course-key ai-engineering-foundations --version 0.40.9 --schema-version 1 --dry-run \
  > "$TEMP_DIR/dry-run.json"
cat "$TEMP_DIR/dry-run.json"
DIGEST="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["content_sha256"])' "$TEMP_DIR/dry-run.json")"

echo "== Refuse publication when the database migration head is stale =="
cd "$ROOT_DIR/backend"
uv run --locked --python "$EXPECTED_PYTHON" --default-index https://pypi.org/simple \
  alembic downgrade 0011_personal_tenant_bootstrap
if uv run --locked --python "$EXPECTED_PYTHON" --default-index https://pypi.org/simple \
  python scripts/publish_course_release.py \
  --content "$TEMP_DIR/course.json" \
  --course-key stale-schema-test --version 0.40.9 --schema-version 1 \
  --expected-sha256 "$DIGEST"; then
  echo "Publisher unexpectedly accepted a stale migration head." >&2
  exit 1
fi
uv run --locked --python "$EXPECTED_PYTHON" --default-index https://pypi.org/simple \
  alembic upgrade head
# Migration downgrade intentionally revokes this out-of-band role grant; restore it
# after the stale-schema guard test to mirror the DBA provisioning procedure.
docker exec --env "PGPASSWORD=$ADMIN_PASSWORD" "$CONTAINER_NAME" \
  psql -h 127.0.0.1 -U postgres -d "$DATABASE_NAME" -v ON_ERROR_STOP=1 \
  -c "GRANT SELECT ON TABLE tenant_memberships TO academy_course_publisher"

echo "== Race two publishers: one insert and one idempotent conflict result =="
uv run --locked --python "$EXPECTED_PYTHON" --default-index https://pypi.org/simple \
  python scripts/publish_course_release.py \
  --content "$TEMP_DIR/course.json" \
  --course-key ai-engineering-foundations --version 0.40.9 --schema-version 1 \
  --expected-sha256 "$DIGEST" > "$TEMP_DIR/publish-a.json" &
PUBLISH_A_PID=$!
uv run --locked --python "$EXPECTED_PYTHON" --default-index https://pypi.org/simple \
  python scripts/publish_course_release.py \
  --content "$TEMP_DIR/course.json" \
  --course-key ai-engineering-foundations --version 0.40.9 --schema-version 1 \
  --expected-sha256 "$DIGEST" > "$TEMP_DIR/publish-b.json" &
PUBLISH_B_PID=$!
wait "$PUBLISH_A_PID"
wait "$PUBLISH_B_PID"
cat "$TEMP_DIR/publish-a.json"
cat "$TEMP_DIR/publish-b.json"
python3 - "$TEMP_DIR/publish-a.json" "$TEMP_DIR/publish-b.json" <<'PYASSERT'
import json
import sys
first, second = [json.load(open(path, encoding="utf-8")) for path in sys.argv[1:]]
assert {first["status"], second["status"]} == {"published", "already_published"}
assert first["release_id"] == second["release_id"]
PYASSERT

echo "== Repeat publication: must remain an idempotent no-op =="
uv run --locked --python "$EXPECTED_PYTHON" --default-index https://pypi.org/simple \
  python scripts/publish_course_release.py \
  --content "$TEMP_DIR/course.json" \
  --course-key ai-engineering-foundations --version 0.40.9 --schema-version 1 \
  --expected-sha256 "$DIGEST" > "$TEMP_DIR/repeat.json"
cat "$TEMP_DIR/repeat.json"

echo "== Reject a different snapshot for an already-published course/version =="
python3 - "$TEMP_DIR/course.json" "$TEMP_DIR/tampered-course.json" <<'PYTAMPER'
import json
import sys
source, destination = sys.argv[1:]
with open(source, encoding="utf-8") as handle:
    course = json.load(handle)
course["description"] += " Tampered content must not replace the published release."
with open(destination, "w", encoding="utf-8") as handle:
    json.dump(course, handle, ensure_ascii=False)
PYTAMPER
uv run --locked --python "$EXPECTED_PYTHON" --default-index https://pypi.org/simple \
  python scripts/publish_course_release.py \
  --content "$TEMP_DIR/tampered-course.json" \
  --course-key ai-engineering-foundations --version 0.40.9 --schema-version 1 --dry-run \
  > "$TEMP_DIR/tampered-dry-run.json"
TAMPERED_DIGEST="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["content_sha256"])' "$TEMP_DIR/tampered-dry-run.json")"
if uv run --locked --python "$EXPECTED_PYTHON" --default-index https://pypi.org/simple \
  python scripts/publish_course_release.py \
  --content "$TEMP_DIR/tampered-course.json" \
  --course-key ai-engineering-foundations --version 0.40.9 --schema-version 1 \
  --expected-sha256 "$TAMPERED_DIGEST"; then
  echo "Conflicting content was unexpectedly accepted for an existing course/version." >&2
  exit 1
fi

echo "== Prove release and audit writes roll back together when audit INSERT is denied =="
docker exec --env "PGPASSWORD=$ADMIN_PASSWORD" "$CONTAINER_NAME" \
  psql -h 127.0.0.1 -U postgres -d "$DATABASE_NAME" -v ON_ERROR_STOP=1 \
  -c "REVOKE INSERT ON TABLE audit_events FROM academy_course_publisher"
if uv run --locked --python "$EXPECTED_PYTHON" --default-index https://pypi.org/simple \
  python scripts/publish_course_release.py \
  --content "$TEMP_DIR/course.json" \
  --course-key atomicity-test --version 0.40.9 --schema-version 1 \
  --expected-sha256 "$DIGEST"; then
  echo "Publication unexpectedly succeeded without audit INSERT privilege." >&2
  exit 1
fi
docker exec --env "PGPASSWORD=$ADMIN_PASSWORD" "$CONTAINER_NAME" \
  psql -h 127.0.0.1 -U postgres -d "$DATABASE_NAME" -v ON_ERROR_STOP=1 \
  -c "GRANT INSERT ON TABLE audit_events TO academy_course_publisher"

echo "== Reject a mismatched reviewed digest before connecting to the database =="
if uv run --locked --python "$EXPECTED_PYTHON" --default-index https://pypi.org/simple \
  python scripts/publish_course_release.py \
  --content "$TEMP_DIR/course.json" \
  --course-key ai-engineering-foundations --version 0.40.9 --schema-version 1 \
  --expected-sha256 "$(printf '0%.0s' {1..64})"; then
  echo "Digest mismatch was unexpectedly accepted." >&2
  exit 1
fi

echo "== Verify row, audit event, role attributes and least-privilege grants =="
docker exec --env "PGPASSWORD=$ADMIN_PASSWORD" "$CONTAINER_NAME" \
  psql -h 127.0.0.1 -U postgres -d "$DATABASE_NAME" -v ON_ERROR_STOP=1 <<'SQL'
DO $$
DECLARE
  release_count integer;
  audit_count integer;
  atomicity_release_count integer;
  role_ok boolean;
  privileges_ok boolean;
BEGIN
  SELECT count(*) INTO release_count FROM course_releases
    WHERE course_key = 'ai-engineering-foundations' AND version = '0.40.9'
      AND status = 'published';
  SELECT count(*) INTO audit_count FROM audit_events
    WHERE action = 'course_release.publish' AND tenant_id IS NULL
      AND actor_user_id IS NULL;
  SELECT count(*) INTO atomicity_release_count FROM course_releases
    WHERE course_key = 'atomicity-test' AND version = '0.40.9';
  SELECT NOT r.rolsuper AND NOT r.rolbypassrls AND NOT r.rolcreatedb
    AND NOT r.rolcreaterole AND NOT r.rolinherit AND r.rolcanlogin
    AND NOT EXISTS (SELECT 1 FROM pg_auth_members m WHERE m.member = r.oid)
    INTO role_ok FROM pg_roles r WHERE r.rolname = 'academy_course_publisher';
  SELECT has_table_privilege('academy_course_publisher', 'course_releases', 'SELECT')
    AND has_table_privilege('academy_course_publisher', 'course_releases', 'INSERT')
    AND NOT has_table_privilege('academy_course_publisher', 'course_releases', 'UPDATE')
    AND NOT has_table_privilege('academy_course_publisher', 'course_releases', 'DELETE')
    AND has_table_privilege('academy_course_publisher', 'audit_events', 'INSERT')
    AND NOT has_table_privilege('academy_course_publisher', 'audit_events', 'SELECT')
    AND has_table_privilege('academy_course_publisher', 'tenant_memberships', 'SELECT')
    AND has_table_privilege('academy_course_publisher', 'alembic_version', 'SELECT')
    AND NOT has_table_privilege('academy_course_publisher', 'alembic_version', 'UPDATE')
    INTO privileges_ok;
  IF release_count <> 1 OR audit_count <> 1 OR atomicity_release_count <> 0
     OR NOT role_ok OR NOT privileges_ok THEN
    RAISE EXCEPTION 'publisher acceptance failed: releases %, audits %, atomicity rows %, role %, privileges %',
      release_count, audit_count, atomicity_release_count, role_ok, privileges_ok;
  END IF;
END $$;
SELECT id, course_key, version, schema_version, content_sha256, status, published_at
  FROM course_releases WHERE course_key = 'ai-engineering-foundations';
SELECT action, resource_type, resource_id, request_id, metadata
  FROM audit_events WHERE action = 'course_release.publish';
SELECT rolname, rolsuper, rolbypassrls, rolcreatedb, rolcreaterole, rolinherit
  FROM pg_roles WHERE rolname = 'academy_course_publisher';
SQL

echo "== Verify published snapshots cannot be mutated or deleted =="
if docker exec --env "PGPASSWORD=$ADMIN_PASSWORD" "$CONTAINER_NAME" \
  psql -h 127.0.0.1 -U postgres -d "$DATABASE_NAME" -v ON_ERROR_STOP=1 \
  -c "UPDATE course_releases SET content = '{}'::jsonb WHERE course_key = 'ai-engineering-foundations'"; then
  echo "Published snapshot mutation was unexpectedly accepted." >&2
  exit 1
fi
if docker exec --env "PGPASSWORD=$ADMIN_PASSWORD" "$CONTAINER_NAME" \
  psql -h 127.0.0.1 -U postgres -d "$DATABASE_NAME" -v ON_ERROR_STOP=1 \
  -c "DELETE FROM course_releases WHERE course_key = 'ai-engineering-foundations'"; then
  echo "Published snapshot deletion was unexpectedly accepted." >&2
  exit 1
fi

echo "== Verify publisher role cannot insert a draft =="
if docker exec --env "PGPASSWORD=$PUBLISHER_PASSWORD" "$CONTAINER_NAME" \
  psql -h 127.0.0.1 -U academy_course_publisher -d "$DATABASE_NAME" -v ON_ERROR_STOP=1 \
  -c "INSERT INTO course_releases (id, course_key, version, schema_version, content_sha256, content, status) VALUES (gen_random_uuid(), 'forbidden-draft', '1.0.0', 1, repeat('0', 64), '{}'::jsonb, 'draft')"; then
  echo "Publisher draft insert was unexpectedly accepted." >&2
  exit 1
fi

echo "== Verify publisher migration downgrade and re-upgrade =="
cd "$ROOT_DIR/backend"
uv run --locked --python "$EXPECTED_PYTHON" --default-index https://pypi.org/simple \
  alembic downgrade 0011_personal_tenant_bootstrap
uv run --locked --python "$EXPECTED_PYTHON" --default-index https://pypi.org/simple \
  alembic upgrade head

echo "Course publisher acceptance completed. The disposable database will now be removed."
