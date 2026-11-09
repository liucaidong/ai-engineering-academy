#!/usr/bin/env python3
"""Greedy coverage-aware few-shot selection under a token budget."""
from __future__ import annotations
import argparse

def select_examples(examples: list[dict[str, object]], budget: int, minimum_tags: set[str]) -> list[dict[str, object]]:
    if budget <= 0:
        raise ValueError("budget must be positive")
    selected: list[dict[str, object]] = []
    used = 0
    covered: set[str] = set()
    remaining = examples[:]
    while remaining:
        feasible = [item for item in remaining if int(item["tokens"]) > 0 and used + int(item["tokens"]) <= budget]
        if not feasible:
            break
        def score(item: dict[str, object]) -> tuple[int, float]:
            tags = set(item["tags"])
            new_coverage = len(tags & minimum_tags - covered)
            return new_coverage, float(item["similarity"])
        choice = max(feasible, key=score)
        selected.append(choice)
        used += int(choice["tokens"])
        covered.update(set(choice["tags"]))
        remaining.remove(choice)
    return selected

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--budget", type=int, default=600)
    args = parser.parse_args()
    examples = [
        {"id": "billing-1", "tokens": 180, "similarity": 0.91, "tags": {"billing", "normal"}},
        {"id": "refund-edge", "tokens": 210, "similarity": 0.83, "tags": {"refund", "edge"}},
        {"id": "security-deny", "tokens": 150, "similarity": 0.72, "tags": {"security", "refusal"}},
        {"id": "billing-duplicate", "tokens": 190, "similarity": 0.95, "tags": {"billing", "normal"}},
    ]
    chosen = select_examples(examples, args.budget, {"billing", "refund", "security", "edge", "refusal"})
    print("Selected:", [item["id"] for item in chosen])
    print("Token cost:", sum(int(item["tokens"]) for item in chosen))
    print("Coverage:", sorted(set().union(*(set(item["tags"]) for item in chosen)) if chosen else set()))

if __name__ == "__main__":
    main()
