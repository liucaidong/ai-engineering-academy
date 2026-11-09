#!/usr/bin/env python3
"""Check capstone defense package completeness and disclose evidence limits."""
from __future__ import annotations

import argparse

REQUIRED = (
    "release_id",
    "commit",
    "dependency_lock",
    "sbom_ref",
    "provenance_ref",
    "environment",
    "model_version",
    "prompt_version",
    "tool_schema_version",
    "index_snapshot",
    "policy_version",
    "dataset_version",
    "evaluation_report_ref",
    "demo_script",
    "evidence_index",
    "limitations",
    "evidence_grade",
)
EVIDENCE_GRADES = {"design-only", "static-reviewed", "simulated", "tested-in-local", "tested-in-target-environment", "production-observed"}


def readiness(manifest: dict[str, str]) -> dict[str, object]:
    if not isinstance(manifest, dict):
        return {"ready": False, "missing": ["manifest_must_be_object"], "unverified": ""}
    missing = [key for key in REQUIRED if not isinstance(manifest.get(key), str) or not manifest[key].strip()]
    if not isinstance(manifest.get("evidence_grade"), str) or manifest["evidence_grade"] not in EVIDENCE_GRADES:
        missing.append("valid_evidence_grade")
    return {"ready": not missing, "missing": missing, "unverified": manifest.get("limitations", "")}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    manifest = {key: f"{key}-frozen" for key in REQUIRED}
    manifest["evidence_grade"] = "tested-in-local"
    print("defense readiness:", readiness(manifest))
    manifest.pop("evidence_index")
    print("incomplete package:", readiness(manifest))
    print("A complete package can still disclose unresolved risks; readiness is not production approval.")


if __name__ == "__main__":
    main()
