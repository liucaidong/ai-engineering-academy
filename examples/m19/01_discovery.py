#!/usr/bin/env python3
"""Prioritize product discovery assumptions by impact, uncertainty and test cost."""
from __future__ import annotations

import argparse
import math


def _finite_number(value: object) -> bool:
    return (
        not isinstance(value, bool)
        and isinstance(value, (int, float))
        and math.isfinite(value)
    )


def assumption_priority(impact: float, uncertainty: float, test_cost: float) -> float:
    if (
        not all(_finite_number(value) for value in (impact, uncertainty, test_cost))
        or not 0 <= impact <= 1
        or not 0 <= uncertainty <= 1
        or test_cost <= 0
    ):
        raise ValueError("impact/uncertainty must be finite [0,1], test cost finite > 0")
    return impact * uncertainty / test_cost


def decide_evidence(score: float, threshold: float = 0.5) -> str:
    if (
        not _finite_number(score)
        or not _finite_number(threshold)
        or score < 0
        or threshold < 0
    ):
        raise ValueError("score and threshold must be finite and non-negative")
    return "test_now" if score >= threshold else "defer_or_monitor"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    assumptions = {
        "user_need": (0.9, 0.8, 0.2),
        "data_access": (1.0, 0.9, 0.4),
        "model_quality": (0.8, 0.5, 0.3),
    }
    ranked = sorted(
        ((name, assumption_priority(*values)) for name, values in assumptions.items()),
        key=lambda item: item[1],
        reverse=True,
    )
    for name, score in ranked:
        print(name, round(score, 2), decide_evidence(score))
    print("Scores prioritize learning; they are not validated product-market-fit probabilities.")


if __name__ == "__main__":
    main()
