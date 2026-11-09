#!/usr/bin/env python3
"""Validate the completeness of a versioned prompt contract manifest."""
from __future__ import annotations
import argparse

REQUIRED_FIELDS = {
    "prompt_id", "version", "owner", "purpose", "input_schema",
    "output_schema", "model_compatibility", "failure_states",
    "evaluation_dataset_version", "rollback_target",
}

def missing_contract_fields(manifest: dict[str, object]) -> list[str]:
    return sorted(REQUIRED_FIELDS - manifest.keys())

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--show-required", action="store_true")
    args = parser.parse_args()
    if args.show_required:
        print("\n".join(sorted(REQUIRED_FIELDS)))
        return
    sample = {
        "prompt_id": "contract-review",
        "version": "1.2.0",
        "owner": "procurement-ai",
        "purpose": "Extract contract terms with evidence",
        "input_schema": "contract-input/v1",
        "output_schema": "contract-findings/v2",
        "model_compatibility": ["model-A"],
        "failure_states": ["needs_clarification", "not_found", "refused"],
        "evaluation_dataset_version": "contracts-eval-2026-11",
        "rollback_target": "1.1.0",
    }
    print("Missing fields:", missing_contract_fields(sample) or "none")
    print("A complete manifest still requires runtime tests and secret-safe observability.")

if __name__ == "__main__":
    main()
