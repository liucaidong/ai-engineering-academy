#!/usr/bin/env python3
"""Model durable approval state and correlate audit events with trace context."""
from __future__ import annotations
import argparse
import hashlib
import hmac
import json
from threading import Lock


class NonceStore:
    """Process-local atomic nonce store; production needs a durable shared DB constraint."""

    def __init__(self) -> None:
        self._used: set[str] = set()
        self._lock = Lock()

    def consume(self, nonce: str) -> bool:
        with self._lock:
            if nonce in self._used:
                return False
            self._used.add(nonce)
            return True


def action_digest(action: dict[str, object]) -> str:
    """Python-only deterministic JSON; not cross-language RFC 8785 canonical JSON."""
    canonical = json.dumps(action, sort_keys=True, separators=(",", ":"), ensure_ascii=False, allow_nan=False)
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def create_approval_request(workflow_id: str, approval_id: str, requester: str, approver: str,
                            action: dict[str, object], policy_version: str, expires_at: int,
                            trace_id: str, nonce: str) -> dict[str, object]:
    return {
        "request_id": f"approval:{workflow_id}:{approval_id}",
        "workflow_id": workflow_id,
        "requester": requester,
        "required_approver": approver,
        "action_digest": action_digest(action),
        "policy_version": policy_version,
        "expires_at": expires_at,
        "nonce": nonce,
        "status": "awaiting_approval",
        "trace_id": trace_id,
    }


def sign_approval_event(request: dict[str, object], event_id: str, actor: str,
                        decision: str, key: bytes) -> dict[str, object]:
    """Called only by a trusted approval service after authenticating the human approver."""
    payload = {
        "event_id": event_id,
        "request_id": request["request_id"],
        "actor": actor,
        "decision": decision,
        "action_digest": request["action_digest"],
        "policy_version": request["policy_version"],
        "expires_at": request["expires_at"],
        "trace_id": request["trace_id"],
        "nonce": request["nonce"],
    }
    message = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()
    signature = hmac.new(key, message, hashlib.sha256).hexdigest()
    return {**payload, "signature": signature}


def apply_approval_event(request: dict[str, object], event: dict[str, object],
                         action: dict[str, object], authenticated_actor: str, now: int,
                         key: bytes, nonce_store: NonceStore) -> bool:
    if request.get("status") != "awaiting_approval":
        return False
    payload = {name: event.get(name) for name in (
        "event_id", "request_id", "actor", "decision", "action_digest", "policy_version", "expires_at", "trace_id", "nonce"
    )}
    if not all(isinstance(payload[name], str) and payload[name] for name in (
        "event_id", "request_id", "actor", "decision", "action_digest", "policy_version", "trace_id", "nonce"
    )) or type(payload["expires_at"]) is not int or type(now) is not int:
        return False
    message = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()
    expected = hmac.new(key, message, hashlib.sha256).hexdigest()
    try:
        digest = action_digest(action)
    except (TypeError, ValueError):
        return False
    if not (
        hmac.compare_digest(str(event.get("signature", "")), expected)
        and event.get("request_id") == request.get("request_id")
        and event.get("decision") in {"approved", "rejected"}
        and event.get("actor") == request.get("required_approver") == authenticated_actor
        and event.get("action_digest") == digest == request.get("action_digest")
        and event.get("policy_version") == request.get("policy_version")
        and event.get("expires_at") == request.get("expires_at")
        and event.get("trace_id") == request.get("trace_id")
        and event.get("nonce") == request.get("nonce")
        and type(request.get("expires_at")) is int
        and now < request["expires_at"]
    ):
        return False
    if not nonce_store.consume(event["nonce"]):
        return False
    request["status"] = event["decision"]
    request["approval_event_id"] = event["event_id"]
    return True

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    action = {"resource": "invoice-7", "amount": 100, "currency": "USD"}
    request = create_approval_request("wf-7", "payment-1", "requester-2", "approver-9", action, "policy-v3", 500, "trace-abc", "nonce-7")
    key = b"demo-approval-key-not-for-production"
    event = sign_approval_event(request, "evt-approval-1", "approver-9", "approved", key)
    nonce_store = NonceStore()
    accepted = apply_approval_event(request, event, action, "approver-9", 300, key, nonce_store)
    replayed = apply_approval_event(request, event, action, "approver-9", 300, key, nonce_store)
    print("approval accepted:", accepted, "replay accepted:", replayed)
    print("workflow state:", request["status"], "trace:", request["trace_id"])
    print("Demo signer assumes an authenticated approver; durable storage and cross-language JCS remain production responsibilities.")

if __name__ == "__main__":
    main()
