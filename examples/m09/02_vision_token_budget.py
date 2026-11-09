#!/usr/bin/env python3
"""Estimate ViT patch, sequence and full-attention token-pair budgets."""
from __future__ import annotations
import argparse
import math

def patch_count(width: int, height: int, patch_size: int) -> int:
    if min(width, height, patch_size) <= 0:
        raise ValueError("dimensions and patch_size must be positive")
    return math.ceil(width / patch_size) * math.ceil(height / patch_size)

def token_budget(images: list[tuple[int, int, int]], text_tokens: int = 0, cls_per_image: bool = True) -> dict[str, int]:
    if text_tokens < 0:
        raise ValueError("text_tokens cannot be negative")
    patches = sum(patch_count(width, height, patch) for width, height, patch in images)
    cls = len(images) if cls_per_image else 0
    sequence = patches + cls + text_tokens
    return {"patch_tokens": patches, "cls_tokens": cls, "text_tokens": text_tokens, "sequence_tokens": sequence, "full_attention_pairs": sequence * sequence}

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--width", type=int, default=384)
    parser.add_argument("--height", type=int, default=384)
    args = parser.parse_args()
    for patch in (16, 8):
        result = token_budget([(args.width, args.height, patch)], text_tokens=64)
        print(f"patch={patch}: {result}")
    print("Counts are a full-attention upper-bound estimate; window/hierarchical architectures differ.")

if __name__ == "__main__":
    main()
