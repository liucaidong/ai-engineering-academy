#!/usr/bin/env python3
"""Compute a Wilson interval and a simple paired-judge order-bias diagnostic."""
from __future__ import annotations
import argparse
import math

def wilson_interval(successes: int, total: int, z: float = 1.96) -> tuple[float, float]:
    if total <= 0 or not 0 <= successes <= total or z <= 0:
        raise ValueError("invalid counts or z")
    p = successes / total
    denom = 1 + z * z / total
    center = (p + z * z / (2 * total)) / denom
    margin = z * math.sqrt(p * (1 - p) / total + z * z / (4 * total * total)) / denom
    return center - margin, center + margin

def position_bias_gap(score_a_first: list[float], score_a_second: list[float]) -> float:
    if not score_a_first or len(score_a_first) != len(score_a_second):
        raise ValueError("paired score arrays must have equal non-zero length")
    first_mean = sum(score_a_first) / len(score_a_first)
    second_mean = sum(score_a_second) / len(score_a_second)
    return abs(first_mean - second_mean)

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--successes", type=int, default=86)
    parser.add_argument("--total", type=int, default=100)
    args = parser.parse_args()
    low, high = wilson_interval(args.successes, args.total)
    print(f"Success rate: {args.successes / args.total:.3f}")
    print(f"95% Wilson interval: [{low:.3f}, {high:.3f}]")
    gap = position_bias_gap([4, 5, 4, 4], [3, 4, 4, 3])
    print(f"Illustrative A-order score gap: {gap:.3f}")
    print("Use paired order swaps and human calibration; an LLM Judge score is not ground truth.")

if __name__ == "__main__":
    main()
