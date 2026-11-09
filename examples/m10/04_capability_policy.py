#!/usr/bin/env python3
"""Check task-scoped capabilities against tenant, action and resource path."""
from __future__ import annotations
import argparse
from pathlib import PurePosixPath

def resource_in_scope(resource: str, scope: str) -> bool:
    target = PurePosixPath(resource)
    root = PurePosixPath(scope)
    if ".." in target.parts or ".." in root.parts:
        return False
    return target == root or root in target.parents

def authorize(capability: dict[str, object], action: str, resource: str, tenant: str, now: int) -> bool:
    if capability.get("tenant") != tenant:
        return False
    if now >= int(capability["expires_at"]):
        return False
    if action not in capability.get("actions", []):
        return False
    return any(resource_in_scope(resource, scope) for scope in capability.get("resource_scopes", []))

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    capability = {"tenant": "tenant-a", "actions": ["read"], "resource_scopes": ["/reports/2026"], "expires_at": 500}
    print("allowed:", authorize(capability, "read", "/reports/2026/q1.pdf", "tenant-a", 100))
    print("wrong tenant:", authorize(capability, "read", "/reports/2026/q1.pdf", "tenant-b", 100))
    print("path traversal:", authorize(capability, "read", "/reports/2026/../secrets.txt", "tenant-a", 100))
    print("Local policy example; production authorization must be enforced by trusted services.")

if __name__ == "__main__":
    main()
