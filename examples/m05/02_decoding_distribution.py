#!/usr/bin/env python3
"""Compute temperature softmax and top-k/top-p candidate sets."""
from __future__ import annotations
import argparse
import math

def softmax(logits: list[float], temperature: float = 1.0) -> list[float]:
    if not logits or temperature <= 0:
        raise ValueError("logits must be non-empty and temperature positive")
    scaled = [value / temperature for value in logits]
    peak = max(scaled)
    exps = [math.exp(value - peak) for value in scaled]
    total = sum(exps)
    return [value / total for value in exps]

def truncate_top_k(probabilities: list[float], k: int) -> list[float]:
    if not probabilities or k <= 0:
        raise ValueError("probabilities must be non-empty and k positive")
    indices = sorted(range(len(probabilities)), key=probabilities.__getitem__, reverse=True)[:k]
    kept = [probabilities[i] if i in indices else 0.0 for i in range(len(probabilities))]
    return normalize(kept)

def truncate_top_p(probabilities: list[float], p: float) -> list[float]:
    if not probabilities or not 0 < p <= 1:
        raise ValueError("probabilities must be non-empty and p in (0, 1]")
    order = sorted(range(len(probabilities)), key=probabilities.__getitem__, reverse=True)
    selected: set[int] = set()
    cumulative = 0.0
    for index in order:
        selected.add(index)
        cumulative += probabilities[index]
        if cumulative >= p:
            break
    return normalize([value if i in selected else 0.0 for i, value in enumerate(probabilities)])

def normalize(values: list[float]) -> list[float]:
    total = sum(values)
    if total <= 0:
        raise ValueError("probability mass must be positive")
    return [value / total for value in values]

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--temperature", type=float, default=1.0)
    parser.add_argument("--top-k", type=int, default=2)
    parser.add_argument("--top-p", type=float, default=0.8)
    args = parser.parse_args()
    probs = softmax([2.0, 1.0, 0.0], args.temperature)
    print("Softmax:", [round(value, 4) for value in probs])
    print("Top-k:", [round(value, 4) for value in truncate_top_k(probs, args.top_k)])
    print("Top-p:", [round(value, 4) for value in truncate_top_p(probs, args.top_p)])
    print("Truncation is followed by renormalization; production implementations may differ in ordering and tie handling.")

if __name__ == "__main__":
    main()
