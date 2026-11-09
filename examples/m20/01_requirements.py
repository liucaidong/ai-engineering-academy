#!/usr/bin/env python3
"""Validate requirement records and measure evidence traceability coverage."""
from __future__ import annotations

import argparse

REQUIRED = (
    "id",
    "statement",
    "priority",
    "owner",
    "acceptance",
    "verification",
    "evidence_status",
)
PRIORITIES = {"must", "should", "could", "wont"}
EVIDENCE_STATUSES = {"planned", "implemented", "reviewed", "tested", "not_tested", "blocked"}


def validate_requirements(items: list[dict[str, str]]) -> list[str]:
    if not isinstance(items, list):
        return ["requirements_must_be_list"]
    errors: list[str] = []
    seen: set[str] = set()
    for index, item in enumerate(items):
        if not isinstance(item, dict):
            errors.append(f"item_{index}_must_be_object")
            continue
        for field in REQUIRED:
            value = item.get(field)
            if not isinstance(value, str) or not value.strip():
                errors.append(f"item_{index}_missing_or_invalid_{field}")
        identifier = item.get("id")
        if isinstance(identifier, str) and identifier.strip():
            if identifier in seen:
                errors.append(f"duplicate_id_{identifier}")
            seen.add(identifier)
        priority = item.get("priority")
        if not isinstance(priority, str) or priority not in PRIORITIES:
            errors.append(f"item_{index}_invalid_priority")
        evidence_status = item.get("evidence_status")
        if not isinstance(evidence_status, str) or evidence_status not in EVIDENCE_STATUSES:
            errors.append(f"item_{index}_invalid_evidence_status")
    return errors


def traceability_coverage(items: list[dict[str, str]]) -> float:
    if not isinstance(items, list) or not items:
        raise ValueError("non-empty requirements list required")
    covered = sum(
        isinstance(item, dict)
        and isinstance(item.get("verification"), str)
        and bool(item["verification"].strip())
        and isinstance(item.get("evidence_status"), str)
        and item["evidence_status"] in EVIDENCE_STATUSES
        for item in items
    )
    # This measures trace links, not whether a test passed or evidence is authentic.
    return covered / len(items)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    items = [
        {"id": "REQ-01", "statement": "grounded answer", "priority": "must", "owner": "team-a", "acceptance": "citation support >= 0.95", "verification": "benchmark-01", "evidence_status": "tested"},
        {"id": "REQ-02", "statement": "tenant isolation", "priority": "must", "owner": "team-b", "acceptance": "cross-tenant denied", "verification": "security-02", "evidence_status": "not_tested"},
    ]
    print("errors:", validate_requirements(items))
    print("traceability coverage:", traceability_coverage(items))
    print("A non-empty evidence label is not proof that the evidence itself is valid.")


if __name__ == "__main__":
    main()
