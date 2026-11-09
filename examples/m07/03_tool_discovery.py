#!/usr/bin/env python3
"""Demonstrate deterministic discovery of deferred tool metadata."""
from __future__ import annotations
import argparse

TOOLS = [
    {"id": "orders.read", "description": "Read order details and status", "tags": {"orders", "read"}, "deferred": False},
    {"id": "orders.search", "description": "Search orders by date and status", "tags": {"orders", "search"}, "deferred": True},
    {"id": "orders.cancel", "description": "Cancel an eligible order", "tags": {"orders", "write"}, "deferred": True},
    {"id": "payments.refund", "description": "Create a refund against an order", "tags": {"payments", "write", "high-risk"}, "deferred": True},
]

def discover(query: str, tools: list[dict[str, object]]) -> list[str]:
    terms = set(query.lower().split())
    ranked = []
    for tool in tools:
        searchable = set(str(tool["description"]).lower().split()) | set(tool["tags"])
        overlap = len(terms & searchable)
        if overlap:
            ranked.append((overlap, str(tool["id"])))
    return [tool_id for _, tool_id in sorted(ranked, key=lambda item: (-item[0], item[1]))]

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--query", default="refund order")
    args = parser.parse_args()
    print("Discovered candidates:", discover(args.query, TOOLS))
    print("Discovery only: the host must still enforce allowlist, authorization, and risk policy.")

if __name__ == "__main__":
    main()
