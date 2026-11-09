#!/usr/bin/env python3
"""Validate a simplified Agent Skills frontmatter model without parsing YAML."""
from __future__ import annotations
import argparse

STANDARD_FIELDS = {"name", "description", "license", "compatibility", "metadata", "allowed-tools"}

def validate_metadata(metadata: dict[str, object], directory_name: str) -> list[str]:
    errors: list[str] = []
    name = metadata.get("name")
    description = metadata.get("description")
    if not isinstance(name, str) or not 1 <= len(name) <= 64:
        errors.append("name_length")
    elif (
        name != name.lower()
        or not all(ch.isascii() and (ch.islower() or ch.isdigit() or ch == "-") for ch in name)
        or name.startswith("-")
        or name.endswith("-")
        or "--" in name
    ):
        errors.append("name_syntax")
    elif name != directory_name:
        errors.append("directory_name_mismatch")
    if not isinstance(description, str) or not 1 <= len(description) <= 1024:
        errors.append("description_length")
    if "license" in metadata and not isinstance(metadata["license"], str):
        errors.append("license_type")
    if "compatibility" in metadata:
        value = metadata["compatibility"]
        if not isinstance(value, str) or not 1 <= len(value) <= 500:
            errors.append("compatibility_length")
    if "metadata" in metadata:
        value = metadata["metadata"]
        if not isinstance(value, dict) or not all(isinstance(k, str) and isinstance(v, str) for k, v in value.items()):
            errors.append("metadata_must_be_string_map")
    if "allowed-tools" in metadata and not isinstance(metadata["allowed-tools"], str):
        errors.append("allowed_tools_type")
    return errors

def describe_field(name: str) -> str:
    if name == "allowed-tools":
        return "experimental; runtime support varies and this is not an authorization boundary"
    if name == "version":
        return "not a standard top-level field; use an organization-defined metadata key"
    return "standard or optional field"

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    sample = {
        "name": "code-review",
        "description": "Review a repository for correctness and security. Use when asked to audit code changes.",
        "metadata": {"org.example/version": "1.2.0"},
    }
    print("valid metadata:", validate_metadata(sample, "code-review"))
    print("allowed-tools:", describe_field("allowed-tools"))
    print("version:", describe_field("version"))
    print("This validates a Python dictionary model; it does not parse YAML frontmatter.")

if __name__ == "__main__":
    main()
