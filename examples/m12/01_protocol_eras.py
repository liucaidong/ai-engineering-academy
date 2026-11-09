#!/usr/bin/env python3
"""Model legacy MCP handshake and modern stateless request metadata."""
from __future__ import annotations
import argparse

LEGACY_VERSIONS = {"2024-11-05", "2025-03-26", "2025-06-18", "2025-11-25"}
MODERN_VERSIONS = {"2026-07-28"}

def protocol_era(version: str) -> str:
    if version in LEGACY_VERSIONS:
        return "legacy_handshake"
    if version in MODERN_VERSIONS:
        return "modern_stateless"
    raise ValueError(f"unsupported protocol version: {version}")

def lifecycle_steps(version: str) -> list[str]:
    era = protocol_era(version)
    if era == "legacy_handshake":
        return ["initialize", "notifications/initialized", "requests"]
    return ["optional server/discover", "per-request _meta", "requests"]

def required_meta(version: str, capabilities: dict[str, object]) -> dict[str, object]:
    if protocol_era(version) == "legacy_handshake":
        return {}
    return {"io.modelcontextprotocol/protocolVersion": version, "io.modelcontextprotocol/clientCapabilities": capabilities}

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    for version in ("2025-11-25", "2026-07-28"):
        print(version, protocol_era(version), lifecycle_steps(version), required_meta(version, {"tools": {}}))
    print("Version matrix teaching model; it does not negotiate with a real MCP peer.")

if __name__ == "__main__":
    main()
