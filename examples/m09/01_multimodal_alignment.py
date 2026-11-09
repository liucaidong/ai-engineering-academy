#!/usr/bin/env python3
"""Compare a toy symmetric contrastive objective with pairwise sigmoid loss."""
from __future__ import annotations
import argparse
import math

def softmax_probabilities(scores: list[float], temperature: float) -> list[float]:
    if not scores or temperature <= 0:
        raise ValueError("scores must be non-empty and temperature positive")
    scaled = [score / temperature for score in scores]
    peak = max(scaled)
    exps = [math.exp(score - peak) for score in scaled]
    total = sum(exps)
    return [value / total for value in exps]

def symmetric_contrastive_loss(similarity: list[list[float]], temperature: float) -> float:
    size = len(similarity)
    if size == 0 or any(len(row) != size for row in similarity):
        raise ValueError("similarity matrix must be non-empty and square")
    row_losses = []
    col_losses = []
    for i in range(size):
        row_losses.append(-math.log(max(softmax_probabilities(similarity[i], temperature)[i], 1e-15)))
        column = [similarity[j][i] for j in range(size)]
        col_losses.append(-math.log(max(softmax_probabilities(column, temperature)[i], 1e-15)))
    return (sum(row_losses) + sum(col_losses)) / (2 * size)

def sigmoid_pair_loss(logit: float, label: int) -> float:
    if label not in (0, 1):
        raise ValueError("label must be 0 or 1")
    return max(logit, 0) - logit * label + math.log1p(math.exp(-abs(logit)))

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    similarities = [[0.9, 0.2, 0.1], [0.1, 0.8, 0.3], [0.2, 0.1, 0.85]]
    print("Positive-pair probability at tau=0.07:", round(softmax_probabilities(similarities[0], 0.07)[0], 6))
    print("Symmetric contrastive loss:", round(symmetric_contrastive_loss(similarities, 0.07), 6))
    print("Pairwise sigmoid positive loss:", round(sigmoid_pair_loss(2.0, 1), 6))
    print("Synthetic matrix only; this is not CLIP/SigLIP training or embedding evaluation.")

if __name__ == "__main__":
    main()
