#!/usr/bin/env python3
"""Compute accuracy, Brier score, and ECE for binary classification examples."""
from __future__ import annotations
import argparse

def classification_metrics(probabilities: list[float], labels: list[int], bins: int = 10) -> dict[str, float]:
    if not probabilities or len(probabilities) != len(labels):
        raise ValueError("probabilities and labels must have the same non-zero length")
    if bins <= 0 or any(not 0 <= p <= 1 for p in probabilities) or any(y not in (0, 1) for y in labels):
        raise ValueError("use probabilities in [0,1], binary labels, and positive bins")
    predictions = [int(p >= 0.5) for p in probabilities]
    accuracy = sum(p == y for p, y in zip(predictions, labels)) / len(labels)
    brier = sum((p - y) ** 2 for p, y in zip(probabilities, labels)) / len(labels)
    ece = 0.0
    confidence_correctness = [
        (max(p, 1 - p), int(p >= 0.5) == y) for p, y in zip(probabilities, labels)
    ]
    for index in range(bins):
        lower, upper = index / bins, (index + 1) / bins
        members = [
            (confidence, correct)
            for confidence, correct in confidence_correctness
            if lower <= confidence < upper or (index == bins - 1 and confidence == 1.0)
        ]
        if members:
            confidence = sum(value for value, _ in members) / len(members)
            observed = sum(correct for _, correct in members) / len(members)
            ece += len(members) / len(labels) * abs(confidence - observed)
    return {"accuracy": accuracy, "brier": brier, "ece": ece}

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--bins", type=int, default=5)
    args = parser.parse_args()
    probabilities = [0.95, 0.80, 0.65, 0.40, 0.20, 0.10]
    labels = [1, 1, 0, 1, 0, 0]
    for name, value in classification_metrics(probabilities, labels, args.bins).items():
        print(f"{name}: {value:.4f}")
    print("ECE depends on binning; report bin count, rule, sample size, and subgroup results.")
    print("Classification calibration does not directly calibrate free-form text generation.")

if __name__ == "__main__":
    main()
