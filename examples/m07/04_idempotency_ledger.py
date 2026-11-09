#!/usr/bin/env python3
"""In-memory teaching ledger for idempotent tool side effects."""
from __future__ import annotations
import argparse
import hashlib
import json
import threading

class IdempotencyLedger:
    def __init__(self) -> None:
        self._records: dict[str, dict[str, str]] = {}
        self._lock = threading.Lock()

    @staticmethod
    def digest(arguments: dict[str, object]) -> str:
        canonical = json.dumps(arguments, sort_keys=True, separators=(",", ":"))
        return hashlib.sha256(canonical.encode()).hexdigest()

    def begin(self, key: str, principal: str, arguments: dict[str, object]) -> tuple[str, str]:
        if not key or not principal:
            raise ValueError("key and principal are required")
        digest = self.digest(arguments)
        with self._lock:
            existing = self._records.get(key)
            if existing:
                if existing["principal"] != principal or existing["digest"] != digest:
                    return "conflict", "idempotency_key_reused_with_different_intent"
                return "existing", existing["state"]
            self._records[key] = {"principal": principal, "digest": digest, "state": "running"}
            return "created", "running"

    def complete(self, key: str, result_ref: str) -> None:
        with self._lock:
            if key not in self._records:
                raise KeyError(key)
            self._records[key]["state"] = f"succeeded:{result_ref}"

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--same-key-different-args", action="store_true")
    args = parser.parse_args()
    ledger = IdempotencyLedger()
    print(ledger.begin("refund-req-1", "user-7", {"order_id": "o-1", "amount_minor": 5000}))
    retry_args = {"order_id": "o-1", "amount_minor": 6000} if args.same_key_different_args else {"amount_minor": 5000, "order_id": "o-1"}
    print(ledger.begin("refund-req-1", "user-7", retry_args))
    print("In-memory demonstration only; production requires durable transactional storage and retention policy.")

if __name__ == "__main__":
    main()
