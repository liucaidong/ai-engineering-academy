#!/usr/bin/env python3
"""Evaluate a simple Agent autonomy envelope and resource budget."""
from __future__ import annotations
import argparse

RISK_LEVEL = {"read": 1, "reversible_write": 2, "irreversible": 3, "cross_system": 4}

def authorize_action(action_class: str, max_risk_level: int, approval_granted: bool = False) -> bool:
    if action_class not in RISK_LEVEL or max_risk_level < 0:
        raise ValueError("unknown action class or invalid risk level")
    level = RISK_LEVEL[action_class]
    if level > max_risk_level:
        return False
    if level >= 3 and not approval_granted:
        return False
    return True

def budget_exhausted(turns: int, max_turns: int, tool_calls: int, max_tool_calls: int, cost: float, max_cost: float) -> list[str]:
    if min(turns, max_turns, tool_calls, max_tool_calls, cost, max_cost) < 0:
        raise ValueError("budget values cannot be negative")
    reasons = []
    if turns >= max_turns:
        reasons.append("turn_budget_exhausted")
    if tool_calls >= max_tool_calls:
        reasons.append("tool_call_budget_exhausted")
    if cost >= max_cost:
        reasons.append("cost_budget_exhausted")
    return reasons

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    print("read action:", authorize_action("read", 2))
    print("irreversible without approval:", authorize_action("irreversible", 4))
    print("irreversible with approval:", authorize_action("irreversible", 4, True))
    print("budget stops:", budget_exhausted(8, 8, 5, 10, 0.42, 1.0))
    print("Synthetic policy arithmetic; not an authorization service.")

if __name__ == "__main__":
    main()
