#!/usr/bin/env python3
"""Compute retrieval ranking metrics and a simple claim-support rate."""
from __future__ import annotations
import argparse
import math

def recall_at_k(retrieved: list[str], relevant: set[str], k: int) -> float:
    if not relevant or k <= 0:
        raise ValueError("relevant set and k must be non-empty/positive")
    return len(set(retrieved[:k]) & relevant) / len(relevant)

def reciprocal_rank(retrieved: list[str], relevant: set[str]) -> float:
    for rank, doc_id in enumerate(retrieved, start=1):
        if doc_id in relevant:
            return 1 / rank
    return 0.0

def ndcg_at_k(retrieved: list[str], relevance: dict[str, int], k: int) -> float:
    if k <= 0 or any(score < 0 for score in relevance.values()):
        raise ValueError("k must be positive and relevance non-negative")
    gains = [relevance.get(doc_id, 0) for doc_id in retrieved[:k]]
    dcg = sum((2 ** gain - 1) / math.log2(rank + 1) for rank, gain in enumerate(gains, start=1))
    ideal = sorted(relevance.values(), reverse=True)[:k]
    idcg = sum((2 ** gain - 1) / math.log2(rank + 1) for rank, gain in enumerate(ideal, start=1))
    return dcg / idcg if idcg else 0.0

def claim_support_rate(supported: list[bool]) -> float:
    if not supported:
        raise ValueError("at least one claim is required")
    return sum(supported) / len(supported)

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    retrieved = ["d3", "d1", "d2", "d4"]
    relevant = {"d1", "d3"}
    graded = {"d1": 3, "d2": 1, "d3": 2, "d4": 0}
    print("Recall@3:", recall_at_k(retrieved, relevant, 3))
    print("MRR:", reciprocal_rank(retrieved, relevant))
    print("nDCG@3:", round(ndcg_at_k(retrieved, graded, 3), 4))
    print("Claim support rate:", claim_support_rate([True, True, False]))
    print("Define relevance labels and claim units before interpreting any metric.")

if __name__ == "__main__":
    main()
