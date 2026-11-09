#!/usr/bin/env python3
"""Illustrate weighted round-robin, admission control and N+1 capacity headroom."""
from __future__ import annotations

import argparse
import math


def weighted_schedule(queues: dict[str, int], weights: dict[str, int], capacity: int) -> list[str]:
    if type(capacity) is not int or capacity < 0:
        raise ValueError("capacity must be a non-negative integer")
    if any(not isinstance(t, str) or not t or type(v) is not int or v < 0 for t, v in queues.items()):
        raise ValueError("queue depths must be non-negative integers")
    if any(t not in queues or type(v) is not int or v <= 0 for t, v in weights.items()):
        raise ValueError("weights must be positive integers for known tenants")
    remaining = dict(queues)
    result: list[str] = []
    tenants = sorted(remaining)
    while len(result) < capacity and any(remaining[t] > 0 for t in tenants):
        for tenant in tenants:
            for _ in range(weights.get(tenant, 1)):
                if remaining[tenant] <= 0 or len(result) >= capacity:
                    break
                result.append(tenant)
                remaining[tenant] -= 1
    return result


def admit(queue_depth: int, max_depth: int, priority: str) -> bool:
    if type(queue_depth) is not int or type(max_depth) is not int or min(queue_depth, max_depth) < 0:
        raise ValueError("queue depth and max depth must be non-negative integers")
    if priority not in {"critical", "standard", "batch"}:
        raise ValueError("unknown priority")
    return queue_depth < max_depth or (priority == "critical" and queue_depth < max_depth + 2)


def capacity_headroom(required: int, available: int, reserve: float) -> float:
    if (type(required) is not int or type(available) is not int or required <= 0 or available < 0
            or isinstance(reserve, bool) or not isinstance(reserve, (int, float))
            or not math.isfinite(reserve) or not 0 <= reserve < 1):
        raise ValueError("invalid capacity inputs")
    return max(0.0, (available - required) / required - reserve)


def n_plus_one_capacity(node_count: int, per_node_capacity: int, peak_demand: int,
                        reserve_fraction: float = 0.0) -> tuple[bool, int, float, float]:
    if (type(node_count) is not int or type(per_node_capacity) is not int or type(peak_demand) is not int
            or node_count < 2 or per_node_capacity <= 0 or peak_demand <= 0
            or isinstance(reserve_fraction, bool) or not isinstance(reserve_fraction, (int, float))
            or not math.isfinite(reserve_fraction) or not 0 <= reserve_fraction < 1):
        raise ValueError("invalid N+1 capacity inputs")
    remaining = (node_count - 1) * per_node_capacity
    required_with_reserve = peak_demand / (1 - reserve_fraction)
    headroom = (remaining - required_with_reserve) / required_with_reserve
    return remaining >= required_with_reserve, remaining, required_with_reserve, headroom


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    queues = {"a":5,"b":5,"c":5}
    print("schedule:", weighted_schedule(queues,{"a":2,"b":1,"c":1},8), "queues unchanged:", queues)
    print("admission:", admit(11,10,"critical"), admit(11,10,"batch"))
    print("headroom:", capacity_headroom(80,120,0.1))
    print("N+1:", n_plus_one_capacity(4,60,100,0.2))
    print("Fairness weights are illustrative; production schedulers must bound queue wait and retries.")


if __name__ == "__main__":
    main()
