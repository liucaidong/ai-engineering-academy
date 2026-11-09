#!/usr/bin/env python3
"""Validate a simplified MCP OAuth issuer, audience and scope binding."""
from __future__ import annotations
import argparse

def validate_access_context(token: dict[str, object], expected_issuer: str, expected_audience: str, required_scopes: set[str]) -> list[str]:
    errors = []
    if token.get("iss") != expected_issuer:
        errors.append("issuer_mismatch")
    audience = token.get("aud")
    audiences = set(audience if isinstance(audience, list) else [audience])
    if expected_audience not in audiences:
        errors.append("audience_mismatch")
    granted = set(token.get("scope", []))
    if not required_scopes.issubset(granted):
        errors.append("insufficient_scope")
    return errors

def may_forward_token(token_audience: str, target_resource: str) -> bool:
    return token_audience == target_resource

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    token = {"iss": "https://id.example", "aud": "https://mcp.example", "scope": ["tools:read", "resources:read"]}
    print("valid token:", validate_access_context(token, "https://id.example", "https://mcp.example", {"tools:read"}))
    print("wrong resource:", may_forward_token("https://mcp.example", "https://other.example"))
    print("Simplified claim checks only; no JWT signature, PKCE or OAuth flow is implemented.")

if __name__ == "__main__":
    main()
