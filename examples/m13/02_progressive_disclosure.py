#!/usr/bin/env python3
"""Estimate the context footprint of progressive Skill loading."""
from __future__ import annotations
import argparse
import math

def estimate_tokens(text: str) -> int:
    # Rough teaching heuristic only; actual tokenization is model-specific.
    return math.ceil(len(text.encode("utf-8")) / 4)

def loading_budget(metadata: str, instructions: str, resources: list[str]) -> dict[str, int]:
    discovery = estimate_tokens(metadata)
    activation = estimate_tokens(instructions)
    execution = sum(estimate_tokens(item) for item in resources)
    return {
        "discovery_tokens": discovery,
        "activation_tokens": activation,
        "execution_resource_tokens": execution,
        "all_at_once_tokens": discovery + activation + execution,
        "discovery_only_savings": activation + execution,
    }

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    budget = loading_budget(
        "name: data-analysis\ndescription: Analyze tabular datasets and report validated findings.",
        "Read the task, inspect schema, validate data, run approved analysis and report caveats.",
        ["Detailed API reference and examples.", "Optional script usage and troubleshooting guide."],
    )
    print("estimated budget:", budget)
    print("Token counts use UTF-8 bytes / 4, not a tokenizer benchmark.")

if __name__ == "__main__":
    main()
