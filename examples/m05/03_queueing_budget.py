#!/usr/bin/env python3
"""Illustrate M/M/1 system time versus pure queue waiting time."""
from __future__ import annotations
import argparse

def mm1_metrics(arrival_rate: float, service_rate: float) -> dict[str, float]:
    if arrival_rate < 0 or service_rate <= 0 or arrival_rate >= service_rate:
        raise ValueError("require 0 <= arrival_rate < service_rate")
    system_time = 1 / (service_rate - arrival_rate)
    queue_wait = arrival_rate / (service_rate * (service_rate - arrival_rate))
    return {
        "utilization": arrival_rate / service_rate,
        "system_time_seconds": system_time,
        "queue_wait_seconds": queue_wait,
        "mean_system_requests": arrival_rate * system_time,
        "mean_queued_requests": arrival_rate * queue_wait,
    }

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--arrival-rate", type=float, default=15.0, help="requests per second")
    parser.add_argument("--service-rate", type=float, default=20.0, help="requests per second")
    args = parser.parse_args()
    for name, value in mm1_metrics(args.arrival_rate, args.service_rate).items():
        print(f"{name}: {value:.4f}")
    print("M/M/1 is a teaching model, not a faithful LLM serving simulator.")
    print("LLM service times depend on prompt/output lengths, batching, KV pressure, and scheduling.")

if __name__ == "__main__":
    main()
