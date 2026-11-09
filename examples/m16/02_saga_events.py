#!/usr/bin/env python3
"""Model a CloudEvents-like envelope, in-memory Outbox/Inbox and Saga compensation."""
from __future__ import annotations
import argparse
from threading import Lock

def validate_event(event: dict[str, object]) -> list[str]:
    errors = []
    for field in ("specversion", "id", "source", "type"):
        if not isinstance(event.get(field), str) or not event[field]:
            errors.append(f"missing_or_invalid_{field}")
    if event.get("specversion") != "1.0":
        errors.append("unsupported_specversion")
    return errors

class EventInbox:
    """Process-local dedupe demo; production needs a durable DB uniqueness constraint."""

    def __init__(self):
        self.seen: set[tuple[str, str]] = set()
        self._lock = Lock()

    def accept(self, event: dict[str, object]) -> bool:
        if validate_event(event):
            raise ValueError("invalid_event")
        key = (str(event["source"]), str(event["id"]))
        with self._lock:
            if key in self.seen:
                return False
            self.seen.add(key)
            return True


class TransactionalOutbox:
    """Simulate a single DB transaction boundary with one process-local lock."""

    def __init__(self):
        self.business_state: dict[str, object] = {}
        self.rows: dict[tuple[str, str], dict[str, object]] = {}
        self._lock = Lock()

    def commit(self, aggregate_id: str, new_state: object, event: dict[str, object]) -> bool:
        if not aggregate_id or validate_event(event):
            raise ValueError("invalid_outbox_commit")
        key = (str(event["source"]), str(event["id"]))
        with self._lock:
            if key in self.rows:
                return False
            # In production, these two writes must be in the same database transaction.
            self.business_state[aggregate_id] = new_state
            self.rows[key] = {"event": dict(event), "published": False}
            return True

    def pending(self) -> list[dict[str, object]]:
        with self._lock:
            return [dict(row["event"]) for row in self.rows.values() if not row["published"]]

    def mark_published(self, source: str, event_id: str) -> bool:
        with self._lock:
            row = self.rows.get((source, event_id))
            if row is None or row["published"]:
                return False
            row["published"] = True
            return True

def compensation_plan(completed_steps: list[str]) -> list[str]:
    mapping = {"inventory_reserved": "release_inventory", "payment_captured": "refund_payment"}
    return [mapping[step] for step in reversed(completed_steps) if step in mapping]

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    event = {"specversion": "1.0", "id": "evt-1", "source": "urn:orders:42", "type": "com.example.payment.captured", "data": {"amount": 100}}
    inbox = EventInbox()
    outbox = TransactionalOutbox()
    print("event errors:", validate_event(event))
    print("first delivery:", inbox.accept(event), "duplicate:", inbox.accept(event))
    print("outbox commit:", outbox.commit("order-42", "paid", event), "duplicate:", outbox.commit("order-42", "paid", event))
    print("pending events:", len(outbox.pending()), "published:", outbox.mark_published(event["source"], event["id"]))
    print("compensation:", compensation_plan(["inventory_reserved", "payment_captured"]))
    print("Compensation is a new business action, not an ACID rollback.")

if __name__ == "__main__":
    main()
