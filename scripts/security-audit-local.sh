#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "== npm production dependency audit =="
pnpm --registry=https://registry.npmjs.org audit --prod

echo
echo "== Python 3.12 environment dependency audit =="
PYTHON_SITE_PACKAGES="$(uv run --project backend --locked --python 3.12.14 --default-index https://pypi.org/simple --extra dev python -c 'import sysconfig; print(sysconfig.get_paths()["purelib"])')"
uvx --from pip-audit pip-audit --path "$PYTHON_SITE_PACKAGES"
