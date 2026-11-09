#!/usr/bin/env python3
"""Derive tenant context from verified claims and enforce object-level resource scope."""
from __future__ import annotations

import argparse
from urllib.parse import quote


def derive_tenant_context(verified_claims: dict[str, object]) -> dict[str, str]:
    """Caller must pass claims only after JWT signature, issuer and audience validation."""
    tenant = verified_claims.get("tenant_id")
    subject = verified_claims.get("sub")
    if not isinstance(tenant, str) or not tenant.strip() or not isinstance(subject, str) or not subject.strip():
        raise ValueError("verified tenant_id and sub claims are required")
    return {"tenant_id": tenant.strip(), "principal_id": subject.strip()}


def authorize_resource(context: dict[str, str], resource: dict[str, object], action: str) -> bool:
    if not context.get("tenant_id") or not context.get("principal_id") or not action:
        return False
    if resource.get("tenant_id") != context["tenant_id"]:
        return False
    allowed_actions = resource.get("allowed_actions", [])
    authorized_principals = resource.get("authorized_principals", [])
    if not isinstance(allowed_actions, list) or action not in allowed_actions:
        return False
    if not isinstance(authorized_principals, list):
        return False
    if resource.get("visibility") == "tenant":
        return True
    return resource.get("owner_id") == context["principal_id"] or context["principal_id"] in authorized_principals


def cache_key(context: dict[str, str], resource_key: str, resource_version: str,
              policy_version: str, scope: str = "principal",
              resource_visibility: str = "private") -> str:
    parts = (context.get("tenant_id"), context.get("principal_id"), resource_key, resource_version, policy_version)
    if any(not isinstance(value, str) or not value.strip() for value in parts):
        raise ValueError("tenant, principal, resource and policy versions must be non-empty strings")
    if scope == "principal":
        subject_scope = f"principal:{context['principal_id']}"
    elif scope == "tenant" and resource_visibility == "tenant":
        subject_scope = "tenant-shared"
    else:
        raise ValueError("tenant cache scope is allowed only for explicitly tenant-visible resources")
    # Encode each component so delimiters in caller-controlled identifiers cannot collide.
    return ":".join((
        "tenant", quote(context["tenant_id"], safe=""), quote(subject_scope, safe=""),
        "resource", quote(resource_key, safe=""), "rv", quote(resource_version, safe=""),
        "pv", quote(policy_version, safe=""),
    ))


def choose_isolation(data_sensitivity: str, scale: str) -> str:
    if data_sensitivity not in {"high", "standard"} or scale not in {"small", "large"}:
        raise ValueError("unknown sensitivity or scale")
    if data_sensitivity == "high":
        return "silo"
    return "bridge" if scale == "large" else "pool"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    ctx = derive_tenant_context({"tenant_id":"tenant-a","sub":"user-7"})
    resource = {"tenant_id":"tenant-a","id":"doc-1","owner_id":"user-7","allowed_actions":["read"],"visibility":"private"}
    print("trusted context:", ctx)
    print("same tenant owner:", authorize_resource(ctx, resource, "read"))
    print("cross tenant:", authorize_resource(ctx, {**resource,"tenant_id":"tenant-b"}, "read"))
    print("private cache key:", cache_key(ctx, "doc-1", "v3", "policy-7"))
    print("isolation:", choose_isolation("high", "large"))
    print("Client-supplied tenant headers must never override verified claims; tenant-shared cache scope requires explicit shared visibility.")


if __name__ == "__main__":
    main()
