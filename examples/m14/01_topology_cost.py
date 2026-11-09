#!/usr/bin/env python3
"""Compare multi-agent total cost and critical-path latency."""
from __future__ import annotations
import argparse

def total_cost(calls: list[dict[str, float]], tool_cost: float = 0.0, coordination_cost: float = 0.0) -> float:
    if tool_cost < 0 or coordination_cost < 0:
        raise ValueError("costs must be non-negative")
    cost = tool_cost + coordination_cost
    for call in calls:
        if call["input_tokens"] < 0 or call["output_tokens"] < 0:
            raise ValueError("token counts must be non-negative")
        cost += call["input_tokens"] * call["input_price_per_million"] / 1_000_000
        cost += call["output_tokens"] * call["output_price_per_million"] / 1_000_000
    return cost

def parallel_latency(durations: list[float], barrier: float = 0.0, synthesis: float = 0.0) -> float:
    if not durations or any(value < 0 for value in durations) or barrier < 0 or synthesis < 0:
        raise ValueError("durations must be non-empty and non-negative")
    return max(durations) + barrier + synthesis

def serial_latency(durations: list[float], coordination: float = 0.0) -> float:
    if not durations or any(value < 0 for value in durations) or coordination < 0:
        raise ValueError("durations must be non-empty and non-negative")
    return sum(durations) + coordination * max(0, len(durations) - 1)

def cost_per_success(total: float, success_rate: float) -> float:
    if total < 0 or not 0 < success_rate <= 1:
        raise ValueError("total cost must be non-negative and success rate in (0, 1]")
    return total / success_rate

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    durations = [8.0, 12.0, 6.0]
    calls = [
        {"input_tokens": 2000, "output_tokens": 500, "input_price_per_million": 2.0, "output_price_per_million": 8.0},
        {"input_tokens": 1500, "output_tokens": 700, "input_price_per_million": 2.0, "output_price_per_million": 8.0},
        {"input_tokens": 1000, "output_tokens": 300, "input_price_per_million": 2.0, "output_price_per_million": 8.0},
    ]
    cost = total_cost(calls, tool_cost=0.02, coordination_cost=0.01)
    print("serial latency:", serial_latency(durations, coordination=1.5))
    print("parallel latency:", parallel_latency(durations, barrier=1.0, synthesis=3.0))
    print("total cost:", round(cost, 6))
    print("cost per successful task at 0.8 success:", round(cost_per_success(cost, 0.8), 6))

if __name__ == "__main__":
    main()
