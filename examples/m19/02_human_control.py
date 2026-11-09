#!/usr/bin/env python3
"""Select human-control requirements and bind approvals to exact actions."""
from __future__ import annotations

import argparse


def control_tier(impact: str, reversible: bool, evidence_quality: str) -> str:
    if (
        impact not in {"low", "medium", "high"}
        or type(reversible) is not bool
        or evidence_quality not in {"weak", "adequate", "strong"}
    ):
        raise ValueError("unknown impact, reversibility or evidence level")
    if impact == "high" and not reversible:
        return "block_or_dual_control"
    if impact == "high" or evidence_quality == "weak":
        return "human_approval"
    if impact == "medium" or not reversible:
        return "confirm_with_preview"
    return "auto_with_audit"


def approval_is_bound(
    approval: dict[str, object], action: dict[str, object], now: int
) -> bool:
    """Check action binding and expiry; nonce consumption/replay protection is separate."""
    if type(now) is not int or not isinstance(approval, dict) or not isinstance(action, dict):
        return False
    fields = (
        "actor",
        "resource",
        "operation",
        "arguments_digest",
        "policy_version",
        "idempotency_key",
        "expires_at",
    )
    if any(
        not isinstance(action.get(field), str) or not action[field]
        for field in fields[:-1]
    ):
        return False
    expiry = action.get("expires_at")
    if type(expiry) is not int or expiry <= now:
        return False
    return all(approval.get(field) == action.get(field) for field in fields)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    for case in [
        ("low", True, "strong"),
        ("medium", True, "adequate"),
        ("high", True, "strong"),
        ("high", False, "strong"),
    ]:
        print(case, control_tier(*case))
    print("Approval must bind actor/resource/operation/argument digest/policy/idempotency/expiry.")


if __name__ == "__main__":
    main()
