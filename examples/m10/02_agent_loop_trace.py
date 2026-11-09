#!/usr/bin/env python3
"""Inspect a toy Plan/Act/Observe trace for repeated actions and stop reasons."""
from __future__ import annotations
import argparse
from collections import Counter

def analyze_trace(events: list[dict[str, str]], max_steps: int) -> dict[str, object]:
    if max_steps <= 0:
        raise ValueError("max_steps must be positive")
    actions = [event["signature"] for event in events if event["kind"] == "action"]
    counts = Counter(actions)
    repeated = sorted(signature for signature, count in counts.items() if count > 1)
    last_status = events[-1].get("status", "unknown") if events else "empty"
    if len(actions) >= max_steps:
        stop = "step_budget_exhausted"
    elif last_status == "goal_verified":
        stop = "goal_verified"
    elif last_status in {"permission_denied", "fatal_error"}:
        stop = last_status
    elif repeated:
        stop = "repeated_action_detected"
    else:
        stop = "continue_or_request_observation"
    return {"action_count": len(actions), "repeated_signatures": repeated, "stop_reason": stop}

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    trace = [
        {"kind": "action", "signature": "search:policy-v3", "status": "submitted"},
        {"kind": "observation", "signature": "result-1", "status": "no_progress"},
        {"kind": "action", "signature": "search:policy-v3", "status": "submitted"},
        {"kind": "observation", "signature": "result-2", "status": "no_progress"},
    ]
    print(analyze_trace(trace, max_steps=8))
    print("A repeated signature is a heuristic; real systems also inspect state progress and action semantics.")

if __name__ == "__main__":
    main()
