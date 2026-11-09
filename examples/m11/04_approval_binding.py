#!/usr/bin/env python3
"""Bind a human approval to an exact action digest and state version."""
from __future__ import annotations
import argparse
import hashlib
import json

def action_digest(action: dict[str, object]) -> str:
    payload = json.dumps(action, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()

def approval_valid(approval: dict[str, object], action: dict[str, object], state_version: int, now: int) -> bool:
    return (
        approval.get("action_digest") == action_digest(action)
        and approval.get("state_version") == state_version
        and now < int(approval["expires_at"])
        and approval.get("decision") == "approved"
    )

def memory_write_allowed(consent: bool, source_present: bool, sensitivity: str) -> bool:
    if not source_present:
        return False
    if sensitivity in {"high", "restricted"} and not consent:
        return False
    return consent or sensitivity == "low"

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    action = {"type": "submit_purchase", "vendor": "vendor-7", "amount": 1200, "currency": "USD"}
    approval = {"action_digest": action_digest(action), "state_version": 4, "expires_at": 500, "decision": "approved"}
    print("approval valid:", approval_valid(approval, action, 4, 200))
    changed = {**action, "amount": 1500}
    print("approval after amount change:", approval_valid(approval, changed, 4, 200))
    print("restricted memory without consent:", memory_write_allowed(False, True, "restricted"))
    print("Digest binding demo only; a production policy service must authenticate actors and enforce state.")

if __name__ == "__main__":
    main()
