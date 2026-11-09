#!/usr/bin/env python3
"""Validate evaluation task contracts and grade observable end-state outcomes."""
from __future__ import annotations
import argparse
import math

def validate_task(task: dict[str, object]) -> list[str]:
    errors = []
    required = ("task_id", "input", "expected_outcome", "graders", "dataset_version")
    for field in required:
        if field not in task:
            errors.append(f"missing_{field}")
    if "task_id" in task and (not isinstance(task["task_id"], str) or not task["task_id"].strip()):
        errors.append("task_id_must_be_nonempty_string")
    if "input" in task and not isinstance(task["input"], dict):
        errors.append("input_must_be_object")
    if "expected_outcome" in task and (not isinstance(task["expected_outcome"], dict) or not task["expected_outcome"]):
        errors.append("expected_outcome_must_be_nonempty_object")
    if "graders" in task and (
        not isinstance(task["graders"], list)
        or not task["graders"]
        or any(not isinstance(grader, str) or not grader for grader in task["graders"])
    ):
        errors.append("graders_must_be_nonempty_string_list")
    if "dataset_version" in task and (not isinstance(task["dataset_version"], str) or not task["dataset_version"].strip()):
        errors.append("dataset_version_must_be_nonempty_string")
    return errors


def grade_outcome(expected: dict[str, object], actual: dict[str, object]) -> bool:
    if not isinstance(expected, dict) or not expected or not isinstance(actual, dict):
        return False
    return all(key in actual and actual[key] == value for key, value in expected.items())


def classify_suite(pass_rate: float, purpose: str) -> str:
    if isinstance(pass_rate, bool) or not isinstance(pass_rate, (int, float)) or not math.isfinite(pass_rate) or not 0 <= pass_rate <= 1:
        raise ValueError("pass rate must be finite and in [0, 1]")
    if purpose not in {"capability", "regression"}:
        raise ValueError("unknown suite purpose")
    return purpose

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    task = {"task_id": "refund-001", "input": {"ticket": "T-7"}, "expected_outcome": {"refund_status": "processed"}, "graders": ["state_check", "tool_policy"], "dataset_version": "v3"}
    actual = {"refund_status": "processed"}
    print("task contract errors:", validate_task(task))
    print("outcome passed:", grade_outcome(task["expected_outcome"], actual))
    print("Suite type:", classify_suite(0.7, "capability"))
    print("This is a contract example, not a production evaluation harness.")

if __name__ == "__main__":
    main()
