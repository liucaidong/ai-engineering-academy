#!/usr/bin/env python3
"""Filter model routes by capability, region, data policy, schema and health."""
from __future__ import annotations

import argparse


def _capabilities(route: dict[str, object]) -> set[str] | None:
    values = route.get("capabilities")
    if not isinstance(values, (list, tuple, set)) or any(not isinstance(value, str) for value in values):
        return None
    return set(values)


def eligible_routes(
    routes: list[dict[str, object]], required: set[str], region: str,
    allowed_providers: set[str], required_context_tokens: int = 0,
    required_schema: str | None = None, allowed_data_policies: set[str] | None = None,
) -> list[dict[str, object]]:
    if (not isinstance(required, set) or any(not isinstance(item, str) or not item for item in required)
            or not region or not isinstance(allowed_providers, set) or not allowed_providers
            or any(not isinstance(item, str) or not item for item in allowed_providers)
            or type(required_context_tokens) is not int or required_context_tokens < 0):
        raise ValueError("invalid route policy")
    eligible = []
    for route in routes:
        capabilities = _capabilities(route)
        context_limit = route.get("context_limit")
        schemas = route.get("schema_versions", [])
        if (
            capabilities is None
            or not required.issubset(capabilities)
            or route.get("region") != region
            or route.get("provider") not in allowed_providers
            or route.get("healthy") is not True
            or route.get("policy_approved") is not True
            or type(context_limit) is not int
            or context_limit < required_context_tokens
            or not isinstance(schemas, (list, tuple, set))
            or (required_schema is not None and required_schema not in schemas)
            or (allowed_data_policies is not None and route.get("data_policy") not in allowed_data_policies)
        ):
            continue
        eligible.append(route)
    return eligible


def fallback_allowed(
    primary: dict[str, object], fallback: dict[str, object], required: set[str],
    region: str, allowed_providers: set[str], required_context_tokens: int = 0,
    required_schema: str | None = None,
) -> bool:
    if (not isinstance(required, set) or any(not isinstance(item, str) or not item for item in required)
            or not isinstance(allowed_providers, set) or not allowed_providers
            or type(required_context_tokens) is not int or required_context_tokens < 0):
        return False
    capabilities = _capabilities(fallback)
    schemas = fallback.get("schema_versions", [])
    return bool(
        capabilities is not None
        and required.issubset(capabilities)
        and fallback.get("provider") in allowed_providers
        and fallback.get("region") == region == primary.get("region")
        and fallback.get("healthy") is True
        and fallback.get("policy_approved") is True
        and fallback.get("data_policy") == primary.get("data_policy")
        and type(fallback.get("context_limit")) is int
        and fallback["context_limit"] >= required_context_tokens
        and isinstance(schemas, (list, tuple, set))
        and (required_schema is None or required_schema in schemas)
    )


def rate_limit_scope(local_used: int, global_used: int, local_limit: int, global_limit: int) -> tuple[bool, bool]:
    values = (local_used, global_used, local_limit, global_limit)
    if any(type(value) is not int for value in values) or min(local_used, global_used) < 0 or min(local_limit, global_limit) < 1:
        raise ValueError("usage and limits must be non-negative/positive integers")
    return local_used < local_limit, global_used < global_limit


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    routes = [
        {"provider":"p1","model":"m1","region":"ap-northeast-1","capabilities":["chat","tools"],"healthy":True,"policy_approved":True,"data_policy":"jp","context_limit":128000,"schema_versions":["json-v1"]},
        {"provider":"p2","model":"m2","region":"us-east-1","capabilities":["chat","tools","vision"],"healthy":True,"policy_approved":True,"data_policy":"global","context_limit":128000,"schema_versions":["json-v1"]},
        {"provider":"p3","model":"m3","region":"ap-northeast-1","capabilities":["chat","tools"],"healthy":False,"policy_approved":True,"data_policy":"jp","context_limit":64000,"schema_versions":["json-v1"]},
    ]
    allowed = {"p1", "p2", "p3"}
    required = {"chat", "tools"}
    eligible = eligible_routes(routes, required, "ap-northeast-1", allowed, 32000, "json-v1", {"jp"})
    print("eligible routes:", eligible)
    print("safe fallback:", fallback_allowed(routes[0], routes[2], required, "ap-northeast-1", allowed, 32000, "json-v1"))
    print("local/global capacity:", rate_limit_scope(9, 90, 10, 100))
    print("Production gateways must atomically coordinate global quota and preserve provider-native semantics.")


if __name__ == "__main__":
    main()
