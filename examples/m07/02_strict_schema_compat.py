#!/usr/bin/env python3
"""Check a small subset of common strict function-schema constraints."""
from __future__ import annotations
import argparse

def strict_schema_issues(schema: dict[str, object], path: str = "$") -> list[str]:
    issues: list[str] = []
    if schema.get("type") == "object":
        properties = schema.get("properties", {})
        if not isinstance(properties, dict):
            return [f"{path}.properties must be an object"]
        if schema.get("additionalProperties") is not False:
            issues.append(f"{path}.additionalProperties must be false")
        required = schema.get("required", [])
        if set(required) != set(properties):
            issues.append(f"{path}.required must list every property")
        for name, child in properties.items():
            if isinstance(child, dict):
                issues.extend(strict_schema_issues(child, f"{path}.properties.{name}"))
    return issues

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--show-issues", action="store_true")
    args = parser.parse_args()
    schema = {
        "type": "object",
        "properties": {
            "order_id": {"type": "string"},
            "reason": {"type": ["string", "null"]},
        },
        "required": ["order_id", "reason"],
        "additionalProperties": False,
    }
    issues = strict_schema_issues(schema)
    print("Strict subset issues:", issues or "none")
    print("This checks a small provider-specific subset, not the full JSON Schema standard.")

if __name__ == "__main__":
    main()
