#!/usr/bin/env python3
"""Model optimistic concurrency and an idempotent append-only evidence log."""
from __future__ import annotations
import argparse
from threading import Lock

class SharedState:
    def __init__(self, value: dict[str, object]):
        self.value = dict(value)
        self.version = 1
        self.events: dict[str, dict[str, object]] = {}
        self._lock = Lock()

    def compare_and_swap(self, expected_version: int, patch: dict[str, object]) -> int:
        with self._lock:
            if expected_version != self.version:
                raise RuntimeError("stale_version")
            self.value.update(patch)
            self.version += 1
            return self.version

    def append_event(self, event_id: str, event: dict[str, object]) -> bool:
        with self._lock:
            if event_id in self.events:
                return False
            self.events[event_id] = dict(event)
            return True

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    state = SharedState({"summary": "initial"})
    state.compare_and_swap(1, {"summary": "revised"})
    print("version:", state.version, "value:", state.value)
    print("append event:", state.append_event("evt-1", {"source_ref": "paper-A"}))
    print("duplicate event:", state.append_event("evt-1", {"source_ref": "paper-A"}))
    try:
        state.compare_and_swap(1, {"summary": "stale overwrite"})
    except RuntimeError as error:
        print("stale write rejected:", error)

if __name__ == "__main__":
    main()
