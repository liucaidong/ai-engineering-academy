#!/usr/bin/env python3
"""Compute Agent task success, pass^k and cost per successful task."""
from __future__ import annotations
import argparse
import math

def success_rate(successes: int, trials: int) -> float:
    if trials <= 0 or not 0 <= successes <= trials:
        raise ValueError("invalid success counts")
    return successes / trials

def pass_k(success_runs: list[list[bool]]) -> float:
    if not success_runs or any(not run for run in success_runs):
        raise ValueError("runs must contain non-empty trial groups")
    return sum(all(run) for run in success_runs) / len(success_runs)

def cost_per_success(total_cost: float, successes: int) -> float:
    if total_cost < 0 or successes <= 0:
        raise ValueError("cost must be non-negative and successes positive")
    return total_cost / successes

def wilson_interval(successes: int, trials: int, z: float = 1.96) -> tuple[float, float]:
    p = success_rate(successes, trials)
    denom = 1 + z * z / trials
    center = (p + z * z / (2 * trials)) / denom
    margin = z * math.sqrt(p * (1 - p) / trials + z * z / (4 * trials * trials)) / denom
    return center - margin, center + margin

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    runs = [[True, True, True], [True, False, True], [True, True, True], [False, True, True]]
    rate = success_rate(9, 12)
    print("success rate:", rate)
    print("pass^3:", pass_k(runs))
    print("95% Wilson interval:", tuple(round(value, 3) for value in wilson_interval(9, 12)))
    print("cost per successful task:", cost_per_success(18.0, 9))
    print("Independent-run pass^k and confidence assumptions must be stated when reporting real Agent reliability.")

if __name__ == "__main__":
    main()
