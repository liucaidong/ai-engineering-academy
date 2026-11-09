#!/usr/bin/env python3
"""Demonstrate PDP/PEP checks and HMAC-bound one-time action approval."""
from __future__ import annotations
import argparse
import hashlib
import hmac
import json
from decimal import Decimal, InvalidOperation
from threading import Lock


class NonceStore:
    """Process-local atomic demo; production needs a durable shared uniqueness constraint."""

    def __init__(self) -> None:
        self._used: set[str] = set()
        self._lock = Lock()

    def consume(self, nonce: str) -> bool:
        with self._lock:
            if nonce in self._used:
                return False
            self._used.add(nonce)
            return True


def _decimal(value: object) -> Decimal | None:
    try:
        result = Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError):
        return None
    return result if result.is_finite() else None


def policy_decision(
    subject: dict[str, object],
    resource: dict[str, object],
    action: str,
    environment: dict[str, object],
    policy: dict[str, object],
) -> tuple[bool, str]:
    subject_id = subject.get("subject_id")
    tenant_id = subject.get("tenant_id")
    resource_id = resource.get("resource_id")
    if not subject_id or not tenant_id or not resource_id or not action:
        return False, "missing_authorization_context"
    if tenant_id != resource.get("tenant_id"):
        return False, "tenant_mismatch"
    role_permissions = policy.get("role_permissions", {})
    if not isinstance(role_permissions, dict):
        return False, "invalid_policy"
    permissions = role_permissions.get(subject.get("role"), set())
    if not isinstance(permissions, (set, list, tuple)):
        return False, "invalid_role_permissions"
    if action not in permissions:
        return False, "role_denied"
    if action == "payment:write":
        amount = _decimal(environment.get("amount"))
        limit = _decimal(policy.get("payment_limit"))
        if amount is None or limit is None or amount < 0 or limit < 0:
            return False, "invalid_payment_amount_or_limit"
        if amount > limit:
            return False, "amount_exceeds_limit"
        if environment.get("mfa_verified") is not True:
            return False, "mfa_required"
    owner_id = resource.get("owner_id")
    authorized_subjects = resource.get("authorized_subjects", [])
    if not isinstance(authorized_subjects, list):
        return False, "invalid_resource_acl"
    if owner_id != subject_id and subject_id not in authorized_subjects:
        return False, "resource_owner_denied"
    return True, "allow"


def action_digest(action: dict[str, object]) -> str:
    """Deterministic Python JSON digest for this demo, not cross-language RFC 8785 JCS."""
    canonical = json.dumps(
        action, sort_keys=True, separators=(",", ":"), ensure_ascii=False, allow_nan=False
    )
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def sign_approval(
    action: dict[str, object], principal: str, approver_id: str,
    expires_at: int, nonce: str, key: bytes,
) -> dict[str, object]:
    if not principal or not approver_id or type(expires_at) is not int or not nonce:
        raise ValueError("approval identity, expiry and nonce are required")
    payload = {
        "principal": principal,
        "approver_id": approver_id,
        "action_digest": action_digest(action),
        "expires_at": expires_at,
        "nonce": nonce,
    }
    message = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()
    return {**payload, "signature": hmac.new(key, message, hashlib.sha256).hexdigest()}


def verify_approval(
    approval: dict[str, object], action: dict[str, object], principal: str,
    authenticated_approver: str, now: int, key: bytes, nonce_store: NonceStore,
) -> bool:
    payload = {name: approval.get(name) for name in (
        "principal", "approver_id", "action_digest", "expires_at", "nonce"
    )}
    if not (
        isinstance(payload["principal"], str)
        and isinstance(payload["approver_id"], str)
        and isinstance(payload["action_digest"], str)
        and type(payload["expires_at"]) is int
        and isinstance(payload["nonce"], str)
        and payload["nonce"]
        and type(now) is int
    ):
        return False
    message = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()
    expected = hmac.new(key, message, hashlib.sha256).hexdigest()
    try:
        digest = action_digest(action)
    except (TypeError, ValueError):
        return False
    if not (
        hmac.compare_digest(str(approval.get("signature", "")), expected)
        and approval.get("principal") == principal
        and approval.get("approver_id") == authenticated_approver
        and approval.get("action_digest") == digest
        and now < approval["expires_at"]
        and isinstance(approval.get("nonce"), str)
        and approval["nonce"]
    ):
        return False
    # Consume only after every cryptographic and contextual check succeeds.
    return nonce_store.consume(approval["nonce"])

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    subject = {"subject_id": "user-7", "tenant_id": "tenant-a", "role": "finance"}
    resource = {"resource_id": "invoice-12", "owner_id": "user-7", "tenant_id": "tenant-a"}
    policy = {"role_permissions": {"finance": {"payment:write"}}, "payment_limit": 500}
    print("PDP decision:", policy_decision(subject, resource, "payment:write", {"amount": 120, "mfa_verified": True}, policy))
    action = {"resource": "invoice-12", "operation": "pay", "amount": 120, "currency": "USD"}
    approval = sign_approval(action, "user-7", "manager-3", 2000, "nonce-1", b"demo-key-not-for-production")
    nonce_store = NonceStore()
    print("approval valid:", verify_approval(approval, action, "user-7", "manager-3", 1500, b"demo-key-not-for-production", nonce_store))
    print("replay accepted:", verify_approval(approval, action, "user-7", "manager-3", 1500, b"demo-key-not-for-production", nonce_store))
    print("This is an HMAC teaching model; production keys belong in a managed secret service.")

if __name__ == "__main__":
    main()
