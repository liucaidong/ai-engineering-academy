#!/usr/bin/env python3
"""Map risks to controls, tests, evidence grades and explicit decisions."""
from __future__ import annotations

import argparse

GRADES = {"design-only": 0, "static-reviewed": 1, "simulated": 2, "tested-in-local": 3, "tested-in-target-environment": 4, "production-observed": 5}
DECISIONS = {"pass", "accepted_residual_risk", "mitigate", "block"}
REQUIRED = ("risk_id", "control", "test_id", "evidence_grade", "decision", "decision_owner", "hard_constraint")


def validate_matrix(rows: list[dict[str, object]]) -> list[str]:
    if not isinstance(rows, list):
        return ["matrix_must_be_list"]
    errors: list[str] = []
    for index, row in enumerate(rows):
        if not isinstance(row, dict):
            errors.append(f"row_{index}_must_be_object")
            continue
        for field in ("risk_id", "control", "test_id", "decision_owner"):
            if not isinstance(row.get(field), str) or not row[field].strip():
                errors.append(f"row_{index}_missing_or_invalid_{field}")
        grade = row.get("evidence_grade")
        if not isinstance(grade, str) or grade not in GRADES:
            errors.append(f"row_{index}_invalid_evidence_grade")
        decision = row.get("decision")
        if not isinstance(decision, str) or decision not in DECISIONS:
            errors.append(f"row_{index}_invalid_decision")
        if type(row.get("hard_constraint")) is not bool:
            errors.append(f"row_{index}_hard_constraint_must_be_boolean")
    return errors


def gate_passes(rows: list[dict[str, object]], minimum_grade: str) -> bool:
    if not isinstance(minimum_grade, str) or minimum_grade not in GRADES or not isinstance(rows, list) or not rows:
        raise ValueError("valid grade and non-empty matrix required")
    if validate_matrix(rows):
        return False
    for row in rows:
        if GRADES[row["evidence_grade"]] < GRADES[minimum_grade]:
            return False
        if row["decision"] not in {"pass", "accepted_residual_risk"}:
            return False
        # A hard security/safety constraint cannot be waived as residual risk.
        if row["hard_constraint"] and row["decision"] != "pass":
            return False
    return True


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    rows = [{"risk_id": "R-01", "control": "server-side authz", "test_id": "SEC-01", "evidence_grade": "tested-in-local", "decision": "pass", "decision_owner": "security-owner", "hard_constraint": True}]
    print("matrix errors:", validate_matrix(rows))
    print("local gate:", gate_passes(rows, "tested-in-local"))
    print("target gate:", gate_passes(rows, "tested-in-target-environment"))
    print("Safety hard constraints must not be averaged into a quality score or waived as residual risk.")


if __name__ == "__main__":
    main()
