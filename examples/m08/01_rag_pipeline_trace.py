#!/usr/bin/env python3
"""Summarize RAG pipeline stage latency and classify basic failure points."""
from __future__ import annotations
import argparse

def summarize_trace(stages: list[dict[str, object]]) -> dict[str, object]:
    if not stages:
        raise ValueError("at least one stage is required")
    total = sum(float(stage["duration_ms"]) for stage in stages)
    failed = [str(stage["name"]) for stage in stages if not bool(stage["ok"])]
    return {"total_ms": total, "failed_stages": failed, "success": not failed}

def classify_rag_failure(retrieved_count: int, acl_denied: bool, citations_valid: bool, answer_supported: bool) -> str:
    if acl_denied:
        return "authorization_or_filtering"
    if retrieved_count == 0:
        return "retrieval_miss"
    if not citations_valid:
        return "citation_integrity"
    if not answer_supported:
        return "generation_grounding"
    return "no_obvious_failure_in_checked_signals"

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    trace = [
        {"name": "query", "duration_ms": 8, "ok": True},
        {"name": "retrieval", "duration_ms": 42, "ok": True},
        {"name": "rerank", "duration_ms": 31, "ok": True},
        {"name": "generation", "duration_ms": 620, "ok": True},
        {"name": "citation_validation", "duration_ms": 4, "ok": True},
    ]
    print("Trace:", summarize_trace(trace))
    print("Failure class:", classify_rag_failure(5, False, True, False))

if __name__ == "__main__":
    main()
