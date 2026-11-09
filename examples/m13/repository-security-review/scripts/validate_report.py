#!/usr/bin/env python3
"""Validate the shape of a repository security review report."""
from __future__ import annotations
import argparse
import json
from pathlib import Path

SEVERITIES = {"critical", "high", "medium", "low", "informational"}
REQUIRED_ENVELOPE = {"commit_sha", "reviewed_scope", "excluded_scope", "checks_performed", "unverified_areas", "findings"}

def validate_report(report: dict[str, object]) -> list[str]:
    errors = []
    missing = REQUIRED_ENVELOPE - set(report)
    if missing:
        errors.append(f"missing_envelope_fields:{','.join(sorted(missing))}")
    findings = report.get("findings")
    if not isinstance(findings, list):
        return errors + ["findings_must_be_list"]
    for index, finding in enumerate(findings):
        if not isinstance(finding, dict):
            errors.append(f"finding_{index}_must_be_object")
            continue
        for field in ("id", "severity", "path", "line_start", "line_end", "evidence", "remediation"):
            if field not in finding:
                errors.append(f"finding_{index}_missing_{field}")
        if finding.get("severity") not in SEVERITIES:
            errors.append(f"finding_{index}_invalid_severity")
        path = finding.get("path")
        if not isinstance(path, str) or not path or Path(path).is_absolute() or ".." in Path(path).parts:
            errors.append(f"finding_{index}_invalid_path")
        start, end = finding.get("line_start"), finding.get("line_end")
        if not isinstance(start, int) or not isinstance(end, int) or start < 1 or end < start:
            errors.append(f"finding_{index}_invalid_line_range")
    return errors

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("report", type=Path)
    args = parser.parse_args()
    report = json.loads(args.report.read_text())
    errors = validate_report(report)
    if errors:
        raise SystemExit("\n".join(errors))
    print("report shape valid; evidence correctness is not verified")

if __name__ == "__main__":
    main()
