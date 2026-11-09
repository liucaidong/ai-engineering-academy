#!/usr/bin/env python3
"""Negotiate MCP extensions and gate Tasks on protocol-era support."""
from __future__ import annotations
import argparse

TASKS_EXTENSION = "io.modelcontextprotocol/tasks"

def negotiate_extensions(client: set[str], server: set[str]) -> set[str]:
    return client & server

def tasks_allowed(version: str, negotiated: set[str], method: str = "tools/call") -> bool:
    # Tasks is an optional extension. The client declares it in per-request
    # capabilities and the server advertises it through server/discover.
    # The current extension defines task-augmented execution for tools/call only.
    return (
        version == "2026-07-28"
        and TASKS_EXTENSION in negotiated
        and method == "tools/call"
    )

def feature_status(feature: str) -> str:
    return {
        "roots": "deprecated",
        "sampling": "deprecated",
        "logging": "deprecated",
        "http+sse": "deprecated",
        "tasks": "official_extension",
        "mcp_apps": "extension",
    }.get(feature, "unknown")

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    negotiated = negotiate_extensions({TASKS_EXTENSION, "com.example/audit"}, {TASKS_EXTENSION})
    print("negotiated:", sorted(negotiated))
    print("tasks extension negotiated:", tasks_allowed("2026-07-28", negotiated))
    print("legacy tasks extension available:", tasks_allowed("2025-11-25", negotiated))
    print("tasks on prompts/get:", tasks_allowed("2026-07-28", negotiated, "prompts/get"))
    print("Roots status:", feature_status("roots"))
    print("Tasks task-augmented execution currently supports tools/call only. Extension IDs and lifecycle are simplified teaching data; consult each official extension specification.")

if __name__ == "__main__":
    main()
