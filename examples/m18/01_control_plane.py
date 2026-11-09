#!/usr/bin/env python3
"""Model desired-state reconciliation and signed, versioned data-plane snapshots."""
from __future__ import annotations

import argparse
import hashlib
import hmac
import json


def reconcile(desired: dict[str, object], observed: dict[str, object]) -> dict[str, tuple[bool, object, bool, object]]:
    """Return (observed_present, observed_value, desired_present, desired_value)."""
    keys = set(desired) | set(observed)
    return {
        key: (key in observed, observed.get(key), key in desired, desired.get(key))
        for key in sorted(keys)
        if key not in desired or key not in observed or observed[key] != desired[key]
    }


def _snapshot_payload(version: int, valid_until: int, schema_version: str,
                      key_id: str, config: dict[str, object]) -> dict[str, object]:
    return {
        "version": version,
        "valid_until": valid_until,
        "schema_version": schema_version,
        "key_id": key_id,
        "config": config,
    }


def _canonical(payload: dict[str, object]) -> bytes:
    return json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False, allow_nan=False).encode("utf-8")


def sign_snapshot(version: int, valid_until: int, schema_version: str,
                  key_id: str, config: dict[str, object], key: bytes) -> dict[str, object]:
    if (type(version) is not int or version < 1 or type(valid_until) is not int
            or not schema_version or not key_id or not isinstance(config, dict)):
        raise ValueError("invalid snapshot metadata")
    payload = _snapshot_payload(version, valid_until, schema_version, key_id, config)
    signature = hmac.new(key, _canonical(payload), hashlib.sha256).hexdigest()
    return {**payload, "signature": signature}


def apply_snapshot(current_version: int, snapshot: dict[str, object], now: int,
                   keyring: dict[str, bytes], supported_schema_versions: set[str] | None = None) -> tuple[bool, str]:
    if type(current_version) is not int or current_version < 0 or type(now) is not int:
        return False, "invalid_clock_or_current_version"
    if not isinstance(snapshot, dict) or not isinstance(snapshot.get("config"), dict):
        return False, "invalid_snapshot_schema"
    version = snapshot.get("version")
    valid_until = snapshot.get("valid_until")
    schema_version = snapshot.get("schema_version")
    key_id = snapshot.get("key_id")
    signature = snapshot.get("signature")
    if type(version) is not int or version <= current_version:
        return False, "stale_version"
    if type(valid_until) is not int or now >= valid_until:
        return False, "snapshot_expired"
    if not isinstance(schema_version, str) or (supported_schema_versions is not None and schema_version not in supported_schema_versions):
        return False, "unsupported_schema_version"
    if not isinstance(key_id, str) or key_id not in keyring or not isinstance(signature, str):
        return False, "unknown_signing_key"
    payload = _snapshot_payload(version, valid_until, schema_version, key_id, snapshot["config"])
    expected = hmac.new(keyring[key_id], _canonical(payload), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(signature, expected):
        return False, "signature_invalid"
    return True, "applied"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    desired = {"model_route": "model-b", "quota_version": 3, "policy_version": 7}
    observed = {"model_route": "model-a", "quota_version": 3, "retired_flag": None}
    key = b"demo-control-plane-key-not-for-production"
    snapshot = sign_snapshot(8, 500, "v1", "control-key-2026-01", desired, key)
    print("reconciliation diff:", reconcile(desired, observed))
    print("snapshot:", apply_snapshot(7, snapshot, 300, {"control-key-2026-01": key}, {"v1"}))
    print("Production should use KMS-backed signing, key rotation and an atomic config swap.")


if __name__ == "__main__":
    main()
