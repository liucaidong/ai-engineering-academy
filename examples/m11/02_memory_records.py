#!/usr/bin/env python3
"""Validate memory provenance, scope and temporal validity."""
from __future__ import annotations
import argparse

REQUIRED = {"memory_id", "type", "content", "source_event_ids", "scope", "recorded_at", "valid_from", "valid_until", "confidence", "version"}

def validate_record(record: dict[str, object]) -> list[str]:
    errors = sorted(REQUIRED - record.keys())
    if not record.get("source_event_ids"):
        errors.append("source_event_ids must not be empty")
    if float(record.get("confidence", -1)) < 0 or float(record.get("confidence", 2)) > 1:
        errors.append("confidence must be between 0 and 1")
    if int(record.get("valid_until", 0)) <= int(record.get("valid_from", 0)):
        errors.append("valid_until must be greater than valid_from")
    return errors

def is_current(record: dict[str, object], now: int, scope: str) -> bool:
    return (
        record.get("scope") == scope
        and int(record["valid_from"]) <= now < int(record["valid_until"])
        and not bool(record.get("deleted", False))
    )

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    record = {"memory_id": "m-1", "type": "preference", "content": "prefers concise reports", "source_event_ids": ["event-22"], "scope": "user-7", "recorded_at": 100, "valid_from": 100, "valid_until": 500, "confidence": 0.95, "version": 1}
    print("schema errors:", validate_record(record))
    print("current in scope:", is_current(record, 200, "user-7"))
    print("wrong scope:", is_current(record, 200, "user-8"))
    print("No persistent memory store or deletion propagation is implemented.")

if __name__ == "__main__":
    main()
