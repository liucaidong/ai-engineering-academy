#!/usr/bin/env python3
"""Rank toy memory records using relevance, recency, salience and confidence."""
from __future__ import annotations
import argparse
import math

def memory_score(relevance: float, age_days: float, salience: float, confidence: float, half_life_days: float = 30) -> float:
    if min(relevance, age_days, salience, confidence) < 0 or max(relevance, salience, confidence) > 1 or half_life_days <= 0:
        raise ValueError("invalid memory score inputs")
    recency = math.exp(-math.log(2) * age_days / half_life_days)
    return 0.4 * relevance + 0.2 * recency + 0.2 * salience + 0.2 * confidence

def rank_memories(records: list[dict[str, object]], half_life_days: float = 30) -> list[tuple[str, float]]:
    scored = [
        (str(item["id"]), memory_score(float(item["relevance"]), float(item["age_days"]), float(item["salience"]), float(item["confidence"]), half_life_days))
        for item in records
    ]
    return sorted(scored, key=lambda pair: pair[1], reverse=True)

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    records = [
        {"id": "old-high-confidence", "relevance": 0.9, "age_days": 120, "salience": 0.8, "confidence": 0.98},
        {"id": "recent-project-state", "relevance": 0.85, "age_days": 2, "salience": 0.9, "confidence": 0.9},
        {"id": "weak-inference", "relevance": 0.7, "age_days": 1, "salience": 0.2, "confidence": 0.35},
    ]
    print("Ranked memories:", rank_memories(records))
    print("Weights are illustrative; expired and unauthorized records must be filtered before ranking.")

if __name__ == "__main__":
    main()
