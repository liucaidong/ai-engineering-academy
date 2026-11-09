#!/usr/bin/env python3
"""Report tool selection, argument, authorization, execution, and outcome metrics."""
from __future__ import annotations
import argparse

def rate(numerator: int, denominator: int) -> float:
    return numerator / denominator if denominator else 0.0

def evaluate(cases: list[dict[str, object]]) -> dict[str, float]:
    if not cases:
        raise ValueError("at least one case is required")
    n = len(cases)
    return {
        "tool_selection_accuracy": rate(sum(c["expected_tool"] == c["actual_tool"] for c in cases), n),
        "argument_valid_rate": rate(sum(bool(c["arguments_valid"]) for c in cases), n),
        "authorization_violation_rate": rate(sum(not bool(c["authorized"]) and bool(c["executed"]) for c in cases), n),
        "execution_success_rate": rate(sum(bool(c["execution_success"]) for c in cases), n),
        "business_outcome_success_rate": rate(sum(bool(c["business_success"]) for c in cases), n),
        "duplicate_side_effect_rate": rate(sum(bool(c["duplicate_side_effect"]) for c in cases), n),
    }

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    cases = [
        {"expected_tool": "orders.read", "actual_tool": "orders.read", "arguments_valid": True, "authorized": True, "executed": True, "execution_success": True, "business_success": True, "duplicate_side_effect": False},
        {"expected_tool": "payments.refund", "actual_tool": "payments.refund", "arguments_valid": True, "authorized": False, "executed": False, "execution_success": False, "business_success": False, "duplicate_side_effect": False},
        {"expected_tool": "orders.search", "actual_tool": "orders.read", "arguments_valid": True, "authorized": True, "executed": True, "execution_success": True, "business_success": False, "duplicate_side_effect": False},
    ]
    for metric, value in evaluate(cases).items():
        print(f"{metric}: {value:.3f}")
    print("Report each layer separately; overall success hides authorization and business failures.")

if __name__ == "__main__":
    main()
