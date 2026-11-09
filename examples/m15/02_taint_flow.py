#!/usr/bin/env python3
"""Model untrusted instruction provenance and sensitive-data egress controls."""
from __future__ import annotations
import argparse

TRUSTED_INSTRUCTION_CHANNELS = {"system", "developer", "user"}
KNOWN_DATA_LABELS = {"public", "internal", "confidential", "secret", "personal-sensitive"}
DESTINATIONS = {"internal", "external"}

def is_trusted_instruction_source(source: str) -> bool:
    # A recognized instruction channel is not itself authorization for an action.
    return source in TRUSTED_INSTRUCTION_CHANNELS


def can_send_data(labels: set[str], destination: str, allowed_labels: set[str]) -> bool:
    if destination not in DESTINATIONS or not labels or not labels.issubset(KNOWN_DATA_LABELS):
        return False
    if destination == "external" and labels & {"secret", "confidential", "personal-sensitive"}:
        return False
    return labels.issubset(allowed_labels)


def can_execute_instruction(source: str, host_policy_approved: bool) -> bool:
    # Content provenance never grants tool authority by itself.
    return is_trusted_instruction_source(source) and host_policy_approved is True

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    print("web content trusted as instruction:", is_trusted_instruction_source("web"))
    print("confidential external export:", can_send_data({"confidential"}, "external", {"public", "confidential"}))
    print("approved host action:", can_execute_instruction("user", True))
    print("Taint labels are teaching metadata; production enforcement belongs at data/tool boundaries.")

if __name__ == "__main__":
    main()
