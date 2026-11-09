#!/usr/bin/env python3
"""Compute Skill trigger and task outcome metrics from labeled examples."""
from __future__ import annotations
import argparse

def trigger_metrics(labels: list[bool], predictions: list[bool]) -> dict[str, float]:
    """Binary trigger metrics; false-trigger share and FPR have different denominators."""
    if len(labels) != len(predictions) or not labels:
        raise ValueError("labels and predictions must be non-empty and equally sized")
    tp = sum(y and p for y, p in zip(labels, predictions))
    fp = sum((not y) and p for y, p in zip(labels, predictions))
    fn = sum(y and (not p) for y, p in zip(labels, predictions))
    tn = sum((not y) and (not p) for y, p in zip(labels, predictions))
    precision = tp / (tp + fp) if tp + fp else 0.0
    recall = tp / (tp + fn) if tp + fn else 0.0
    false_positive_rate = fp / (fp + tn) if fp + tn else 0.0
    false_trigger_share = fp / len(labels)
    return {
        "precision": precision,
        "recall": recall,
        "false_positive_rate": false_positive_rate,
        "false_trigger_share": false_trigger_share,
    }


def skill_selection_metrics(
    expected: list[str | None], selected: list[str | None]
) -> dict[str, float]:
    """Multi-skill routing metrics; None means no Skill should be selected."""
    if len(expected) != len(selected) or not expected:
        raise ValueError("expected and selected must be non-empty and equally sized")
    positive = sum(item is not None for item in expected)
    negative = len(expected) - positive
    wrong = sum(
        want is not None and got is not None and want != got
        for want, got in zip(expected, selected)
    )
    missed = sum(want is not None and got is None for want, got in zip(expected, selected))
    false_activation = sum(want is None and got is not None for want, got in zip(expected, selected))
    exact = sum(want == got for want, got in zip(expected, selected))
    return {
        "wrong_skill_rate": wrong / positive if positive else 0.0,
        "activation_miss_rate": missed / positive if positive else 0.0,
        "false_activation_rate": false_activation / negative if negative else 0.0,
        "exact_selection_accuracy": exact / len(expected),
    }

def task_success_rate(successes: list[bool]) -> float:
    if not successes:
        raise ValueError("successes must not be empty")
    return sum(successes) / len(successes)

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    labels = [True, True, False, False, True, False]
    predictions = [True, False, True, False, True, False]
    print("trigger metrics:", trigger_metrics(labels, predictions))
    print("multi-skill routing:", skill_selection_metrics(["repo", "data", None, "repo", None], ["repo", "repo", "other", None, None]))
    print("task success:", task_success_rate([True, True, False, True]))
    print("Metrics are illustrative; use representative, independently labeled test sets.")

if __name__ == "__main__":
    main()
