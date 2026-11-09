#!/usr/bin/env python3
"""Evaluate paired agent runs, cost per success and latency uncertainty."""
from __future__ import annotations
import argparse
import math

def wilson_interval(successes: int, trials: int, z: float = 1.96) -> tuple[float, float]:
    if trials <= 0 or not 0 <= successes <= trials:
        raise ValueError("invalid binomial counts")
    p = successes / trials
    denominator = 1 + z * z / trials
    center = (p + z * z / (2 * trials)) / denominator
    margin = z * math.sqrt(p * (1 - p) / trials + z * z / (4 * trials * trials)) / denominator
    return max(0.0, center - margin), min(1.0, center + margin)

def percentile(values: list[float], quantile: float) -> float:
    if not values or not 0 <= quantile <= 1:
        raise ValueError("non-empty values and quantile in [0, 1] required")
    ordered = sorted(values)
    rank = max(0, math.ceil(quantile * len(ordered)) - 1)
    return ordered[rank]

def cost_per_success(costs: list[float], successes: list[bool]) -> float:
    if len(costs) != len(successes) or not costs:
        raise ValueError("costs and outcomes must be non-empty and aligned")
    if any(cost < 0 for cost in costs):
        raise ValueError("costs must be non-negative")
    count = sum(successes)
    if count == 0:
        return math.inf
    return sum(costs) / count

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    baseline_success = [True, True, False, True, False, True]
    candidate_success = [True, True, True, True, False, True]
    candidate_cost = [0.12, 0.15, 0.19, 0.11, 0.16, 0.18]
    latency = [8.2, 9.1, 11.4, 7.8, 14.2, 10.0]
    print("baseline success:", sum(baseline_success) / len(baseline_success))
    print("candidate success:", sum(candidate_success) / len(candidate_success))
    print("candidate Wilson 95%:", wilson_interval(sum(candidate_success), len(candidate_success)))
    print("candidate cost per success:", cost_per_success(candidate_cost, candidate_success))
    print("candidate P95 latency:", percentile(latency, 0.95))

if __name__ == "__main__":
    main()
