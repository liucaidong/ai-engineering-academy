#!/usr/bin/env python3
"""Teaching implementation of simplified BM25 and Reciprocal Rank Fusion."""
from __future__ import annotations
import argparse
import math
import re
from collections import Counter

def tokenize(text: str) -> list[str]:
    return re.findall(r"[a-z0-9]+", text.lower())

def bm25_scores(query: str, documents: dict[str, str], k1: float = 1.5, b: float = 0.75) -> dict[str, float]:
    if not documents or k1 <= 0 or not 0 <= b <= 1:
        raise ValueError("invalid documents or BM25 parameters")
    tokenized = {doc_id: tokenize(text) for doc_id, text in documents.items()}
    avg_len = sum(map(len, tokenized.values())) / len(tokenized)
    query_terms = tokenize(query)
    scores = {doc_id: 0.0 for doc_id in documents}
    for term in set(query_terms):
        df = sum(term in set(tokens) for tokens in tokenized.values())
        idf = math.log(1 + (len(documents) - df + 0.5) / (df + 0.5))
        for doc_id, tokens in tokenized.items():
            tf = Counter(tokens)[term]
            length = len(tokens)
            denom = tf + k1 * (1 - b + b * length / avg_len)
            scores[doc_id] += idf * (tf * (k1 + 1) / denom if denom else 0.0)
    return scores

def rrf_fuse(rankings: list[list[str]], k: int = 60) -> dict[str, float]:
    if k <= 0:
        raise ValueError("k must be positive")
    scores: dict[str, float] = {}
    for ranking in rankings:
        for rank, doc_id in enumerate(ranking, start=1):
            scores[doc_id] = scores.get(doc_id, 0.0) + 1 / (k + rank)
    return scores

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--query", default="travel reimbursement limit")
    args = parser.parse_args()
    docs = {
        "policy-2026": "travel reimbursement policy maximum daily limit",
        "policy-2024": "old travel policy reimbursement rates",
        "expense-form": "expense claim form and receipt requirements",
    }
    bm25 = bm25_scores(args.query, docs)
    bm25_rank = sorted(bm25, key=bm25.get, reverse=True)
    dense_rank = ["expense-form", "policy-2026", "policy-2024"]
    fused = rrf_fuse([bm25_rank, dense_rank])
    print("BM25 rank:", bm25_rank)
    print("RRF rank:", sorted(fused, key=fused.get, reverse=True))
    print("Simplified lexical BM25 only; no embedding model or vector index is executed.")

if __name__ == "__main__":
    main()
