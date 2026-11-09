#!/usr/bin/env python3
"""Select human-oversight strength from impact, reversibility and data sensitivity."""
from __future__ import annotations
import argparse

# Illustrative organization policy thresholds; not NIST or EU AI Act mandated levels.
def oversight_tier(impact: int, reversible: bool, data_sensitivity: int, external_side_effect: bool) -> tuple[str, int]:
    if not 1 <= impact <= 5 or not 1 <= data_sensitivity <= 5:
        raise ValueError("impact and data sensitivity must be in [1, 5]")
    if type(reversible) is not bool or type(external_side_effect) is not bool:
        raise ValueError("reversible and external_side_effect must be booleans")
    if impact == 5 and (not reversible or external_side_effect):
        return "dual_approval", 2
    if impact >= 4 or data_sensitivity >= 4 or external_side_effect or not reversible:
        return "explicit_approval", 1
    if impact >= 3 or data_sensitivity >= 3:
        return "sampled_review", 0
    return "automated_with_monitoring", 0

def review_context_complete(context: dict[str, object]) -> bool:
    required = {"actor", "target", "normalized_args", "consequence", "source_evidence", "policy_reason"}
    return required.issubset(context) and all(context[field] not in (None, "", [], {}) for field in required)

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    print("delete production data:", oversight_tier(5, False, 4, True))
    print("summarize public report:", oversight_tier(1, True, 1, False))
    print("Human review is effective only when reviewers see the actual action and can reject it.")

if __name__ == "__main__":
    main()
