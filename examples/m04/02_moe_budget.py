#!/usr/bin/env python3
"""Separate total MoE parameter capacity from per-token active parameters."""
from __future__ import annotations
import argparse

def moe_parameter_budget(shared: int, experts: int, params_per_expert: int, top_k: int, router: int = 0) -> tuple[int, int]:
    if min(shared, experts, params_per_expert, top_k, router) < 0 or experts == 0 or top_k == 0:
        raise ValueError("counts must be non-negative; experts and top_k must be positive")
    if top_k > experts:
        raise ValueError("top_k cannot exceed experts")
    return shared + experts * params_per_expert + router, shared + top_k * params_per_expert + router

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--shared", type=int, default=1_200_000_000)
    parser.add_argument("--experts", type=int, default=8)
    parser.add_argument("--params-per-expert", type=int, default=90_000_000)
    parser.add_argument("--top-k", type=int, default=2)
    parser.add_argument("--router", type=int, default=0)
    parser.add_argument("--bytes-per-parameter", type=float, default=2.0)
    args = parser.parse_args()
    total, active = moe_parameter_budget(args.shared, args.experts, args.params_per_expert, args.top_k, args.router)
    print(f"Total parameters: {total:,}")
    print(f"Approx. active parameters per token: {active:,}")
    print(f"Active/total ratio: {active / total:.2%}")
    print(f"All-weight payload: {total * args.bytes_per_parameter / 1e9:.3f} GB")
    print("Active parameters are not resident memory. Runtime memory also includes activations,")
    print("KV cache, buffers, optimizer state during training, and communication.")

if __name__ == "__main__":
    main()
