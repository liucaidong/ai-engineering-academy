#!/usr/bin/env python3
"""Compare an LLM judge against human labels and inspect position bias."""
from __future__ import annotations
import argparse

def confusion_matrix(human: list[bool], judge: list[bool]) -> dict[str, int]:
    if len(human) != len(judge) or not human or any(type(value) is not bool for value in human + judge):
        raise ValueError("human and judge labels must be non-empty aligned booleans")
    return {
        "tp": sum(h and j for h, j in zip(human, judge)),
        "fp": sum((not h) and j for h, j in zip(human, judge)),
        "tn": sum((not h) and (not j) for h, j in zip(human, judge)),
        "fn": sum(h and (not j) for h, j in zip(human, judge)),
    }

def cohen_kappa(human: list[bool], judge: list[bool]) -> float:
    matrix = confusion_matrix(human, judge)
    n = len(human)
    observed = (matrix["tp"] + matrix["tn"]) / n
    human_pos = sum(human) / n
    judge_pos = sum(judge) / n
    expected = human_pos * judge_pos + (1 - human_pos) * (1 - judge_pos)
    if expected == 1:
        return 1.0 if observed == 1 else 0.0
    return (observed - expected) / (1 - expected)

def first_position_win_rate(winners: list[str]) -> float:
    if not winners or any(winner not in {"first", "second", "tie"} for winner in winners):
        raise ValueError("winners must contain first/second/tie labels")
    decisive = [winner for winner in winners if winner in {"first", "second"}]
    if not decisive:
        raise ValueError("at least one decisive comparison required")
    return decisive.count("first") / len(decisive)


def paired_order_position_rate(original_order: list[str], swapped_order: list[str]) -> float:
    """Aggregate first-position preference across the same A/B pairs in both orders."""
    if not original_order or len(original_order) != len(swapped_order):
        raise ValueError("original and swapped results must be non-empty and paired")
    return first_position_win_rate(original_order + swapped_order)

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    human = [True, True, False, False, True, False]
    judge = [True, False, False, False, True, True]
    print("confusion:", confusion_matrix(human, judge))
    print("Cohen kappa:", round(cohen_kappa(human, judge), 3))
    print("first-position win rate:", first_position_win_rate(["first", "second", "first", "tie", "first"]))
    print("paired order first-position rate:", paired_order_position_rate(["first", "second"], ["first", "second"]))

if __name__ == "__main__":
    main()
