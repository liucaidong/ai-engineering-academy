#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/backend/.env"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE. Configure the local publisher connection first." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

if [[ -z "${ACADEMY_PUBLISHER_DATABASE_URL:-}" ]]; then
  echo "ACADEMY_PUBLISHER_DATABASE_URL must be configured." >&2
  exit 1
fi

TEMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TEMP_DIR"' EXIT
COURSE_FILE="$TEMP_DIR/course.json"
DRY_RUN_FILE="$TEMP_DIR/dry-run.json"

cd "$ROOT_DIR"
echo "== Export and validate the exact frontend curriculum =="
node scripts/export-course-release.mjs "$COURSE_FILE"

cd "$ROOT_DIR/backend"
COURSE_KEY="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1], encoding="utf-8"))["id"])' "$COURSE_FILE")"
VERSION="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1], encoding="utf-8"))["version"])' "$COURSE_FILE")"
SCHEMA_VERSION="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1], encoding="utf-8"))["schemaVersion"])' "$COURSE_FILE")"

echo "== Calculate the content digest without publishing =="
uv run --locked --python 3.12.14 --default-index https://pypi.org/simple \
  python scripts/publish_course_release.py \
  --content "$COURSE_FILE" \
  --course-key "$COURSE_KEY" \
  --version "$VERSION" \
  --schema-version "$SCHEMA_VERSION" --dry-run > "$DRY_RUN_FILE"
cat "$DRY_RUN_FILE"

DIGEST="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1], encoding="utf-8"))["content_sha256"])' "$DRY_RUN_FILE")"
COURSE_KEY="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1], encoding="utf-8"))["course_key"])' "$DRY_RUN_FILE")"
VERSION="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1], encoding="utf-8"))["version"])' "$DRY_RUN_FILE")"
SCHEMA_VERSION="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1], encoding="utf-8"))["schema_version"])' "$DRY_RUN_FILE")"

if [[ -z "${ACADEMY_EXPECTED_COURSE_SHA256:-}" ]]; then
  echo "Review the course export and digest above. No database write occurred."
  echo "After approval, rerun with ACADEMY_EXPECTED_COURSE_SHA256=$DIGEST"
  exit 2
fi
if [[ "$ACADEMY_EXPECTED_COURSE_SHA256" != "$DIGEST" ]]; then
  echo "The approved digest does not match the current course content; refusing to publish." >&2
  exit 1
fi

echo "== Publish the reviewed immutable snapshot =="
uv run --locked --python 3.12.14 --default-index https://pypi.org/simple \
  python scripts/publish_course_release.py \
  --content "$COURSE_FILE" \
  --course-key "$COURSE_KEY" \
  --version "$VERSION" \
  --schema-version "$SCHEMA_VERSION" \
  --expected-sha256 "$DIGEST"
