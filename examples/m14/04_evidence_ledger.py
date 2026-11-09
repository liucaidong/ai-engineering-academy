#!/usr/bin/env python3
"""Score claim evidence without treating agent votes as independent proof."""
from __future__ import annotations
import argparse

def independent_source_count(evidence: list[dict[str, str]]) -> int:
    """Count declared source lineages, not agents or duplicated source IDs."""
    return len({item["lineage_id"] for item in evidence if item.get("lineage_id")})

def claim_status(evidence: list[dict[str, str]], external_verification_passed: bool) -> str:
    has_support = any(item.get("stance") == "supports" for item in evidence)
    has_contradiction = any(item.get("stance") == "contradicts" for item in evidence)
    if external_verification_passed and has_support and not has_contradiction:
        return "verified"
    if has_support or has_contradiction:
        return "needs_review"
    return "unresolved"

def agent_diversity(agents: list[dict[str, str]]) -> dict[str, int]:
    """Report configuration diversity indicators, not statistical independence."""
    return {
        "models": len({agent.get("model", "") for agent in agents if agent.get("model")}),
        "prompts": len({agent.get("prompt_id", "") for agent in agents if agent.get("prompt_id")}),
        "tools": len({agent.get("toolset", "") for agent in agents if agent.get("toolset")}),
        "sources": len({agent.get("source_pool", "") for agent in agents if agent.get("source_pool")}),
    }

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    evidence = [
        {"source_id": "primary-paper", "lineage_id": "paper-A", "stance": "supports"},
        {"source_id": "same-paper-second-agent-copy", "lineage_id": "paper-A", "stance": "supports"},
        {"source_id": "independent-replication", "lineage_id": "replication-B", "stance": "supports"},
    ]
    agents = [
        {"model": "model-A", "prompt_id": "p1", "toolset": "search-A", "source_pool": "papers-A"},
        {"model": "model-A", "prompt_id": "p1", "toolset": "search-A", "source_pool": "papers-A"},
        {"model": "model-B", "prompt_id": "p2", "toolset": "test-runner", "source_pool": "papers-B"},
    ]
    print("independent sources:", independent_source_count(evidence))
    print("claim status:", claim_status(evidence, external_verification_passed=True))
    print("agent diversity:", agent_diversity(agents))

if __name__ == "__main__":
    main()
