#!/usr/bin/env python3
"""Validate a reproducible AI product release manifest and rollback target."""
from __future__ import annotations

import argparse

REQUIRED = (
    "code_commit",
    "container_image_digest",
    "runtime_config_version",
    "provider_version",
    "model_version",
    "prompt_version",
    "tool_schema_version",
    "index_snapshot",
    "embedding_version",
    "dataset_version",
    "evaluation_report_digest",
    "policy_version",
    "api_schema_version",
    "price_table_version",
    "feature_flag_set",
    "environment",
)


def validate_manifest(manifest: dict[str, object]) -> list[str]:
    if not isinstance(manifest, dict):
        return ["manifest_must_be_object"]
    return [
        f"missing_or_invalid_{field}"
        for field in REQUIRED
        if not isinstance(manifest.get(field), str) or not manifest[field].strip()
    ]


def rollback_compatible(
    current: dict[str, object], target: dict[str, object]
) -> bool:
    # A release controller must separately verify data/schema migration compatibility.
    return (
        not validate_manifest(current)
        and not validate_manifest(target)
        and current.get("environment") == target.get("environment")
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    manifest = {key: f"{key}-v3" for key in REQUIRED}
    manifest["environment"] = "staging"
    print("manifest errors:", validate_manifest(manifest))
    target = {**manifest, "model_version": "model-v2", "prompt_version": "prompt-v2"}
    print("rollback target complete:", rollback_compatible(manifest, target))
    print("Production gates must verify compatibility, canary evidence, data migrations, signatures and approvals.")


if __name__ == "__main__":
    main()
