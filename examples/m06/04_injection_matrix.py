#!/usr/bin/env python3
"""Check whether a prompt-injection test matrix covers key source classes."""
from __future__ import annotations
import argparse

REQUIRED_ATTACK_CLASSES = {
    "direct_user", "indirect_web", "indirect_document",
    "tool_result_spoof", "cross_turn_persistence", "data_exfiltration",
}

def missing_attack_classes(cases: list[dict[str, str]]) -> set[str]:
    covered = {case["attack_class"] for case in cases}
    return REQUIRED_ATTACK_CLASSES - covered

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--show-required", action="store_true")
    args = parser.parse_args()
    if args.show_required:
        print("\n".join(sorted(REQUIRED_ATTACK_CLASSES)))
        return
    cases = [
        {"id": "red-01", "attack_class": "direct_user"},
        {"id": "red-02", "attack_class": "indirect_web"},
        {"id": "red-03", "attack_class": "indirect_document"},
        {"id": "red-04", "attack_class": "tool_result_spoof"},
        {"id": "red-05", "attack_class": "cross_turn_persistence"},
        {"id": "red-06", "attack_class": "data_exfiltration"},
    ]
    print("Missing attack classes:", sorted(missing_attack_classes(cases)) or "none")
    print("Coverage is not proof of defense; execute each case against model and tool runtime.")

if __name__ == "__main__":
    main()
