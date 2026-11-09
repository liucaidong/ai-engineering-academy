#!/usr/bin/env python3
"""Check a vertical slice has success, failure and security-denial evidence."""
from __future__ import annotations

import argparse

REQUIRED_PATHS = {"success", "failure", "security_denial"}


def validate_slice(events: list[dict[str, str]]) -> list[str]:
    if not isinstance(events, list):
        return ["events_must_be_list"]
    errors: list[str] = []
    seen: set[str] = set()
    for index, event in enumerate(events):
        if not isinstance(event, dict):
            errors.append(f"event_{index}_must_be_object")
            continue
        path = event.get("path")
        if not isinstance(path, str) or path not in REQUIRED_PATHS:
            errors.append(f"event_{index}_invalid_path")
            continue
        if path in seen:
            errors.append(f"duplicate_path_{path}")
        seen.add(path)
        for field in ("trace_id", "evidence_ref"):
            if not isinstance(event.get(field), str) or not event[field].strip():
                errors.append(f"event_{index}_missing_{field}")
    for path in sorted(REQUIRED_PATHS - seen):
        errors.append(f"missing_path_{path}")
    return errors


def evidence_grade(kind: str) -> str:
    grades = {"mock": "simulated", "local": "tested-in-local", "target": "tested-in-target-environment", "production": "production-observed"}
    if not isinstance(kind, str) or kind not in grades:
        raise ValueError("unknown evidence kind")
    return grades[kind]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    events = [{"path": "success", "trace_id": "tr-1", "evidence_ref": "log-1"}, {"path": "failure", "trace_id": "tr-2", "evidence_ref": "log-2"}, {"path": "security_denial", "trace_id": "tr-3", "evidence_ref": "audit-3"}]
    print("slice errors:", validate_slice(events))
    print("mock grade:", evidence_grade("mock"), "local grade:", evidence_grade("local"))
    print("Mock output cannot establish external provider integration.")


if __name__ == "__main__":
    main()
