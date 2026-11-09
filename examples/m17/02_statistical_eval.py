#!/usr/bin/env python3
"""Calculate Wilson intervals, paired bootstrap deltas and pass@k variants."""
from __future__ import annotations

import argparse
import math
import random


def wilson_interval(successes: int, trials: int, z: float = 1.96) -> tuple[float, float]:
    if (
        type(successes) is not int
        or type(trials) is not int
        or trials <= 0
        or not 0 <= successes <= trials
        or isinstance(z, bool)
        or not isinstance(z, (int, float))
        or not math.isfinite(z)
        or z <= 0
    ):
        raise ValueError("invalid binomial counts or z value")
    p = successes / trials
    denominator = 1 + z * z / trials
    center = (p + z * z / (2 * trials)) / denominator
    margin = z * math.sqrt(p * (1 - p) / trials + z * z / (4 * trials * trials)) / denominator
    return max(0.0, center - margin), min(1.0, center + margin)


def paired_bootstrap_interval(
    deltas: list[float], iterations: int = 2000, seed: int = 7
) -> tuple[float, float]:
    if (
        not deltas
        or type(iterations) is not int
        or iterations < 100
        or any(
            isinstance(value, bool)
            or not isinstance(value, (int, float))
            or not math.isfinite(value)
            for value in deltas
        )
    ):
        raise ValueError("finite numeric deltas required and iterations must be >= 100")
    rng = random.Random(seed)
    means = []
    for _ in range(iterations):
        sample = [rng.choice(deltas) for _ in deltas]
        means.append(sum(sample) / len(sample))
    means.sort()
    return means[int(0.025 * iterations)], means[min(iterations - 1, int(0.975 * iterations))]


def pass_at_k(success_rate: float, k: int) -> float:
    """IID Bernoulli approximation: probability of >=1 success in k independent trials."""
    if (
        isinstance(success_rate, bool)
        or not isinstance(success_rate, (int, float))
        or not math.isfinite(success_rate)
        or not 0 <= success_rate <= 1
        or type(k) is not int
        or k < 1
    ):
        raise ValueError("invalid success rate or k")
    return 1 - (1 - success_rate) ** k


def human_eval_pass_at_k(n: int, c: int, k: int) -> float:
    """Unbiased finite-sample estimator: 1 - C(n-c,k) / C(n,k)."""
    if type(n) is not int or type(c) is not int or type(k) is not int or n < 1 or not 0 <= c <= n or not 1 <= k <= n:
        raise ValueError("require integers with n >= 1, 0 <= c <= n and 1 <= k <= n")
    failures = n - c
    if k > failures:
        return 1.0
    return 1.0 - math.comb(failures, k) / math.comb(n, k)


def pass_power_k(success_rate: float, k: int) -> float:
    """IID Bernoulli approximation: probability all k independent trials succeed."""
    if (
        isinstance(success_rate, bool)
        or not isinstance(success_rate, (int, float))
        or not math.isfinite(success_rate)
        or not 0 <= success_rate <= 1
        or type(k) is not int
        or k < 1
    ):
        raise ValueError("invalid success rate or k")
    return success_rate**k


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    print("Wilson 95%:", wilson_interval(80, 100))
    print("paired bootstrap:", paired_bootstrap_interval([0.0, 0.1, -0.1, 0.2, 0.0]))
    print("IID pass@3:", pass_at_k(0.8, 3), "pass^3:", pass_power_k(0.8, 3))
    print("HumanEval pass@5 (n=10,c=3):", human_eval_pass_at_k(10, 3, 5))
    print("Bootstrap resamples task-level paired deltas in this teaching model.")


if __name__ == "__main__":
    main()
