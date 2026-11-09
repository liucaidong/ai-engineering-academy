"""Export the FastAPI OpenAPI schema as a deterministic, checked-in contract."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from app.main import app

REPOSITORY_ROOT = Path(__file__).resolve().parents[2]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--output",
        type=Path,
        default=REPOSITORY_ROOT / "openapi" / "openapi.json",
        help="Output path (defaults to openapi/openapi.json).",
    )
    args = parser.parse_args()

    schema = app.openapi()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(schema, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    print(f"Exported OpenAPI {schema['openapi']} ({len(schema['paths'])} paths) to {args.output}")


if __name__ == "__main__":
    main()
