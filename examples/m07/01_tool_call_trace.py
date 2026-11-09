#!/usr/bin/env python3
"""Validate legal host-side tool call state transitions."""
from __future__ import annotations
import argparse

TRANSITIONS = {
    "proposed": {"validated", "cancelled"},
    "validated": {"authorized", "failed", "cancelled"},
    "authorized": {"running", "failed", "cancelled"},
    "running": {"succeeded", "failed", "unknown", "cancelled"},
    "unknown": {"succeeded", "failed"},
    "succeeded": set(),
    "failed": set(),
    "cancelled": set(),
}

def transition(current: str, target: str) -> str:
    if current not in TRANSITIONS or target not in TRANSITIONS[current]:
        raise ValueError(f"illegal transition: {current} -> {target}")
    return target

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--timeout-after-submit", action="store_true")
    args = parser.parse_args()
    state = "proposed"
    for next_state in ("validated", "authorized", "running"):
        state = transition(state, next_state)
    state = transition(state, "unknown" if args.timeout_after_submit else "succeeded")
    print("Final state:", state)
    if state == "unknown":
        print("Query the external operation by idempotency key before retrying.")

if __name__ == "__main__":
    main()
