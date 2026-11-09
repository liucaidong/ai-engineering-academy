#!/usr/bin/env python3
"""Check ADR completeness, option comparison and lifecycle status."""
from __future__ import annotations

import argparse

FIELDS = ("id", "status", "context", "options", "decision", "consequences", "validation_plan", "owner")
STATUSES = {"proposed", "accepted", "deprecated", "superseded"}


def validate_adr(adr: dict[str, object]) -> list[str]:
    if not isinstance(adr, dict):
        return ["adr_must_be_object"]
    errors = [
        f"missing_or_invalid_{field}"
        for field in ("id", "status", "context", "decision", "consequences", "validation_plan", "owner")
        if not isinstance(adr.get(field), str) or not adr[field].strip()
    ]
    status = adr.get("status")
    if not isinstance(status, str) or status not in STATUSES:
        errors.append("invalid_status")
    options = adr.get("options")
    if not isinstance(options, list) or len(options) < 2 or any(not isinstance(option, str) or not option.strip() for option in options):
        errors.append("options_must_contain_at_least_two_nonempty_strings")
    return errors


def adr_state_valid(status: str) -> bool:
    return isinstance(status, str) and status in STATUSES

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    adr = {"id": "ADR-003", "status": "accepted", "context": "tenant data boundary", "options": ["shared pool", "dedicated silo"], "decision": "tiered bridge", "consequences": "higher operations cost", "validation_plan": "cross-tenant negative tests", "owner": "architect"}
    print("ADR errors:", validate_adr(adr))
    print("state valid:", adr_state_valid(adr["status"]))
    print("Accepted ADRs still require implementation evidence and review triggers.")


if __name__ == "__main__":
    main()
