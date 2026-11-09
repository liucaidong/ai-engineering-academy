#!/usr/bin/env python3
"""Build and validate a modern MCP Streamable HTTP request envelope."""
from __future__ import annotations
import argparse

def build_request(method: str, name: str, request_id: int, params: dict[str, object], protocol_version: str, capabilities: dict[str, object]) -> dict[str, object]:
    return {
        "headers": {"MCP-Protocol-Version": protocol_version, "Mcp-Method": method, "Mcp-Name": name},
        "body": {
            "jsonrpc": "2.0",
            "id": request_id,
            "method": method,
            "params": {"name": name, **params, "_meta": {
                "io.modelcontextprotocol/protocolVersion": protocol_version,
                "io.modelcontextprotocol/clientCapabilities": capabilities,
            }},
        },
    }

def validate_route(request: dict[str, object]) -> bool:
    headers = request["headers"]
    body = request["body"]
    params = body["params"]
    return (
        headers["Mcp-Method"] == body["method"]
        and headers["Mcp-Name"] == params["name"]
        and headers["MCP-Protocol-Version"] == params["_meta"]["io.modelcontextprotocol/protocolVersion"]
    )

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    request = build_request("tools/call", "search", 1, {"arguments": {"query": "MCP"}}, "2026-07-28", {"tools": {}})
    print("request:", request)
    print("route consistent:", validate_route(request))
    print("Modern transport does not require Mcp-Session-Id or a GET SSE endpoint.")

if __name__ == "__main__":
    main()
