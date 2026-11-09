#!/usr/bin/env python3
"""Demonstrate event-history replay and idempotent side-effect deduplication."""
from __future__ import annotations
import argparse

def execute_once(operation_id: str, result: str, ledger: dict[str, str], side_effects: list[str]) -> str:
    if operation_id in ledger:
        return ledger[operation_id]
    side_effects.append(operation_id)
    ledger[operation_id] = result
    return result

def replay_event_history(events: list[dict[str, str]]) -> dict[str, str]:
    state: dict[str, str] = {}
    for event in events:
        if event["type"] == "state_update":
            state[event["key"]] = event["value"]
    return state

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    ledger: dict[str, str] = {}
    side_effects: list[str] = []
    print("first attempt:", execute_once("refund-123", "accepted", ledger, side_effects))
    print("retry:", execute_once("refund-123", "accepted", ledger, side_effects))
    print("external side effects:", side_effects)
    events = [{"type": "state_update", "key": "step", "value": "approved"}, {"type": "state_update", "key": "receipt", "value": "stored"}]
    print("replayed state:", replay_event_history(events))
    print("Toy ledger only; no durable store, transaction or exactly-once guarantee is implemented.")

if __name__ == "__main__":
    main()
