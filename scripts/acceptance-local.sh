#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXPECTED_NODE="$(tr -d '\n' < "$ROOT_DIR/.node-version")"
EXPECTED_PYTHON="$(tr -d '\n' < "$ROOT_DIR/.python-version")"

cd "$ROOT_DIR"

ACTUAL_NODE="$(node --version | sed 's/^v//')"
ACTUAL_PNPM="$(pnpm --version)"

if [[ "$ACTUAL_NODE" != "$EXPECTED_NODE" ]]; then
  echo "Node.js mismatch: expected $EXPECTED_NODE, got $ACTUAL_NODE" >&2
  exit 1
fi

if [[ "$ACTUAL_PNPM" != "12.7.0" ]]; then
  echo "pnpm mismatch: expected 12.7.0, got $ACTUAL_PNPM" >&2
  exit 1
fi

echo "== Frontend: Node.js $ACTUAL_NODE / pnpm $ACTUAL_PNPM =="
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm validate:course
pnpm build
pnpm test:e2e
pnpm test:examples:m04
pnpm test:examples:m05
pnpm test:examples:m06
pnpm test:examples:m07
pnpm test:examples:m08
pnpm test:examples:m09
pnpm test:examples:m10
pnpm test:examples:m11
pnpm test:examples:m12
pnpm test:examples:m13
pnpm test:examples:m14
pnpm test:examples:m15
pnpm test:examples:m16
pnpm test:examples:m17
pnpm test:examples:m18
pnpm test:examples:m19
pnpm test:examples:m20

echo "== Backend: Python $EXPECTED_PYTHON / uv =="
cd "$ROOT_DIR/backend"
uv sync --locked --python "$EXPECTED_PYTHON" --default-index https://pypi.org/simple --extra dev

ACTUAL_PYTHON="$("$ROOT_DIR/backend/.venv/bin/python" --version | awk '{print $2}')"
if [[ "$ACTUAL_PYTHON" != "$EXPECTED_PYTHON" ]]; then
  echo "Python mismatch: expected $EXPECTED_PYTHON, got $ACTUAL_PYTHON" >&2
  exit 1
fi

uv run --locked --python "$EXPECTED_PYTHON" --default-index https://pypi.org/simple ruff format --check app migrations tests scripts
uv run --locked --python "$EXPECTED_PYTHON" --default-index https://pypi.org/simple ruff check app migrations tests scripts
uv run --locked --python "$EXPECTED_PYTHON" --default-index https://pypi.org/simple pytest -q

echo "== Local acceptance completed =="
