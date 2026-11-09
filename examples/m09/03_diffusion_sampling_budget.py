#!/usr/bin/env python3
"""Estimate diffusion denoiser calls for sampler steps and CFG implementation."""
from __future__ import annotations
import argparse

def denoiser_calls(steps: int, model_calls_per_step: int = 1) -> int:
    if steps <= 0 or model_calls_per_step <= 0:
        raise ValueError("steps and calls_per_step must be positive")
    return steps * model_calls_per_step

def estimated_latency_ms(steps: int, model_calls_per_step: int, latency_per_call_ms: float, overhead_ms: float = 0) -> float:
    if latency_per_call_ms < 0 or overhead_ms < 0:
        raise ValueError("latencies cannot be negative")
    return denoiser_calls(steps, model_calls_per_step) * latency_per_call_ms + overhead_ms

def cfg_calls_per_step(guidance_enabled: bool, batched_uncond_cond: bool = False) -> int:
    if not guidance_enabled:
        return 1
    return 1 if batched_uncond_cond else 2

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--steps", type=int, default=20)
    parser.add_argument("--forward-ms", type=float, default=85)
    args = parser.parse_args()
    for cfg, batched in ((False, False), (True, False), (True, True)):
        calls = cfg_calls_per_step(cfg, batched)
        total = estimated_latency_ms(args.steps, calls, args.forward_ms, overhead_ms=120)
        print(f"CFG={cfg}, batched={batched}: {denoiser_calls(args.steps, calls)} NFE, estimated {total:.1f} ms")
    print("Illustrative arithmetic only; actual pipelines may fuse or cache conditional computations.")

if __name__ == "__main__":
    main()
