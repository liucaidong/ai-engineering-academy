#!/usr/bin/env python3
"""Estimate chunk counts and create simple word-window chunks for teaching."""
from __future__ import annotations
import argparse
import math

def estimate_chunk_count(document_tokens: int, chunk_size: int, overlap: int) -> int:
    if document_tokens <= 0 or chunk_size <= 0 or overlap < 0 or overlap >= chunk_size:
        raise ValueError("require D>0, C>0, and 0 <= overlap < chunk_size")
    if document_tokens <= chunk_size:
        return 1
    return math.ceil((document_tokens - chunk_size) / (chunk_size - overlap)) + 1

def split_words(words: list[str], chunk_size: int, overlap: int) -> list[list[str]]:
    if chunk_size <= 0 or overlap < 0 or overlap >= chunk_size:
        raise ValueError("invalid chunk size or overlap")
    chunks = []
    step = chunk_size - overlap
    for start in range(0, len(words), step):
        chunk = words[start:start + chunk_size]
        if chunk:
            chunks.append(chunk)
        if start + chunk_size >= len(words):
            break
    return chunks


def estimate_chunk_stats(document_tokens: int, chunk_size: int, overlap: int) -> dict[str, int | float]:
    """Separate real indexed tokens from fixed-size padded capacity."""
    count = estimate_chunk_count(document_tokens, chunk_size, overlap)
    step = chunk_size - overlap
    last_start = (count - 1) * step
    last_chunk_tokens = min(chunk_size, document_tokens - last_start)
    actual_indexed_tokens = (count - 1) * chunk_size + last_chunk_tokens
    padded_capacity = count * chunk_size
    duplicated_tokens = actual_indexed_tokens - document_tokens
    padding_tokens = padded_capacity - actual_indexed_tokens
    return {
        "chunks": count,
        "actual_indexed_tokens": actual_indexed_tokens,
        "duplicated_tokens": duplicated_tokens,
        "redundancy_ratio": duplicated_tokens / document_tokens,
        "padded_capacity_slots": padded_capacity,
        "padding_tokens": padding_tokens,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--document-tokens", type=int, default=10000)
    parser.add_argument("--chunk-size", type=int, default=500)
    parser.add_argument("--overlap", type=int, default=100)
    args = parser.parse_args()
    stats = estimate_chunk_stats(args.document_tokens, args.chunk_size, args.overlap)
    print(f"Estimated chunks: {stats['chunks']}")
    print(f"Actual indexed tokens (including overlap): {stats['actual_indexed_tokens']:,}")
    print(f"Duplicated overlap tokens: {stats['duplicated_tokens']:,} ({stats['redundancy_ratio']:.1%} of source)")
    print(f"Padded fixed-size capacity slots: {stats['padded_capacity_slots']:,}")
    print(f"Unused padding in final chunk: {stats['padding_tokens']:,}")
    print("Uniform-window estimate only; tokenizer-aware and structure-aware splitters change boundaries and counts.")

if __name__ == "__main__":
    main()
