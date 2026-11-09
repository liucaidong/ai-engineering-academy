#!/usr/bin/env python3
"""Estimate a simple KV budget and maximum concurrent sequence count."""
from __future__ import annotations
import argparse
import math

def serving_capacity(total_gib: float, weights_gib: float, fixed_overhead_gib: float, reserve_fraction: float, kv_per_request_gib: float) -> tuple[float, int]:
    if min(total_gib, weights_gib, fixed_overhead_gib, kv_per_request_gib) < 0:
        raise ValueError("memory values cannot be negative")
    if total_gib <= 0 or kv_per_request_gib <= 0 or not 0 <= reserve_fraction < 1:
        raise ValueError("invalid total memory, per-request KV, or reserve fraction")
    usable = total_gib * (1 - reserve_fraction)
    kv_budget = max(0.0, usable - weights_gib - fixed_overhead_gib)
    return kv_budget, math.floor(kv_budget / kv_per_request_gib)

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--total-gib", type=float, default=80.0)
    parser.add_argument("--weights-gib", type=float, default=50.0)
    parser.add_argument("--fixed-overhead-gib", type=float, default=5.0)
    parser.add_argument("--reserve-fraction", type=float, default=0.10)
    parser.add_argument("--kv-per-request-gib", type=float, default=2.0)
    args = parser.parse_args()
    budget, concurrency = serving_capacity(
        args.total_gib, args.weights_gib, args.fixed_overhead_gib,
        args.reserve_fraction, args.kv_per_request_gib
    )
    print(f"KV budget: {budget:.2f} GiB")
    print(f"Upper-bound concurrent requests: {concurrency}")
    print("This bound excludes workload variation, fragmentation, admission-control headroom, and SLO constraints.")

if __name__ == "__main__":
    main()
