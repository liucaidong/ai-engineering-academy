#!/usr/bin/env python3
"""Estimate per-request KV cache and block-rounded Paged KV allocation."""
from __future__ import annotations
import argparse
import math

def kv_cache_bytes(layers: int, batch: int, tokens: int, kv_heads: int, head_dim: int, bytes_per_element: int) -> int:
    values = (layers, batch, tokens, kv_heads, head_dim, bytes_per_element)
    if any(value <= 0 for value in values):
        raise ValueError("all dimensions must be positive")
    return 2 * layers * batch * tokens * kv_heads * head_dim * bytes_per_element

def paged_token_capacity(tokens: int, block_size: int) -> int:
    if tokens <= 0 or block_size <= 0:
        raise ValueError("tokens and block_size must be positive")
    return math.ceil(tokens / block_size) * block_size

def gibibytes(byte_count: int) -> float:
    return byte_count / (1024 ** 3)

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--layers", type=int, default=32)
    parser.add_argument("--batch", type=int, default=1)
    parser.add_argument("--tokens", type=int, default=16384)
    parser.add_argument("--kv-heads", type=int, default=8)
    parser.add_argument("--head-dim", type=int, default=128)
    parser.add_argument("--bytes-per-element", type=int, default=2)
    parser.add_argument("--block-size", type=int, default=16)
    args = parser.parse_args()
    exact = kv_cache_bytes(args.layers, args.batch, args.tokens, args.kv_heads, args.head_dim, args.bytes_per_element)
    rounded_tokens = paged_token_capacity(args.tokens, args.block_size)
    paged = kv_cache_bytes(args.layers, args.batch, rounded_tokens, args.kv_heads, args.head_dim, args.bytes_per_element)
    print(f"Exact KV payload: {gibibytes(exact):.3f} GiB")
    print(f"Paged token capacity: {rounded_tokens:,} tokens")
    print(f"Block-rounded KV payload: {gibibytes(paged):.3f} GiB")
    print(f"Tail-block overhead: {gibibytes(paged - exact):.6f} GiB")
    print("Excludes block tables, allocator metadata, fragmentation, runtime buffers, and shared-prefix effects.")

if __name__ == "__main__":
    main()
