#!/usr/bin/env python3
"""Validate MCP cache hints and construct authorization-aware cache keys."""
from __future__ import annotations
import argparse

def cache_policy(ttl_ms: int, cache_scope: str) -> dict[str, object]:
    if ttl_ms < 0 or cache_scope not in {"public", "private"}:
        raise ValueError("invalid ttlMs or cacheScope")
    return {"ttlMs": ttl_ms, "cacheScope": cache_scope, "cacheable": ttl_ms > 0}

def cache_key(method: str, protocol_version: str, resource_version: str, parameters: str, tenant: str | None, principal: str | None, scope: str) -> tuple[str, ...]:
    if scope not in {"public", "private"}:
        raise ValueError("invalid cache scope")
    base = (method, protocol_version, resource_version, parameters)
    if scope == "public":
        return base
    if not tenant or not principal:
        raise ValueError("private cache requires tenant and principal")
    return base + (tenant, principal)

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    print("public policy:", cache_policy(30000, "public"))
    print("private policy:", cache_policy(5000, "private"))
    print("private key:", cache_key("tools/list", "2026-07-28", "v4", "{}", "tenant-a", "user-7", "private"))
    print("Cache hints are freshness/sharing declarations, not authorization controls.")

if __name__ == "__main__":
    main()
