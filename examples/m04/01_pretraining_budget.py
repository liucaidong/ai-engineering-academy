#!/usr/bin/env python3
"""Teaching calculator for dense-model pretraining compute."""
from __future__ import annotations
import argparse

def estimate_training_flops(parameters: float, training_tokens: float, factor: float = 6.0) -> float:
    if parameters <= 0 or training_tokens <= 0 or factor <= 0:
        raise ValueError("all inputs must be positive")
    return factor * parameters * training_tokens

def estimate_device_seconds(flops: float, sustained_flops_per_second: float) -> float:
    if flops <= 0 or sustained_flops_per_second <= 0:
        raise ValueError("inputs must be positive")
    return flops / sustained_flops_per_second

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--parameters", type=float, default=7e9)
    parser.add_argument("--tokens", type=float, default=1.2e12)
    parser.add_argument("--factor", type=float, default=6.0)
    parser.add_argument("--sustained-flops-per-second", type=float)
    args = parser.parse_args()
    flops = estimate_training_flops(args.parameters, args.tokens, args.factor)
    print(f"Estimated training compute: {flops:.4e} FLOPs")
    print("Rough dense-model estimate; excludes data and many system costs.")
    if args.sustained_flops_per_second:
        seconds = estimate_device_seconds(flops, args.sustained_flops_per_second)
        print(f"Idealized device time: {seconds / 3600:.2f} device-hours")
        print("Not distributed wall-clock time; account for utilization, communication,")
        print("checkpointing, failures, evaluation, and parallel efficiency.")

if __name__ == "__main__":
    main()
