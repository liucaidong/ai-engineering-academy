#!/usr/bin/env python3
"""Calculate bounded retry schedules and model a simple circuit breaker."""
from __future__ import annotations
import argparse
import random

RETRYABLE = {"transient", "rate_limited"}

def retry_delays(base: float, factor: float, cap: float, attempts: int, seed: int = 1) -> list[float]:
    """Full Jitter: each delay is Uniform(0, min(cap, base * factor**attempt))."""
    if base <= 0 or factor < 1 or cap <= 0 or attempts < 0:
        raise ValueError("invalid retry parameters")
    rng = random.Random(seed)
    delays = []
    for index in range(attempts):
        window = min(cap, base * factor**index)
        delays.append(rng.uniform(0.0, window))
    return delays

def should_retry(error_class: str) -> bool:
    return error_class in RETRYABLE

class CircuitBreaker:
    def __init__(self, failure_threshold: int, reset_after: int):
        if failure_threshold < 1 or reset_after < 0:
            raise ValueError("invalid circuit breaker configuration")
        self.failure_threshold = failure_threshold
        self.reset_after = reset_after
        self.state = "closed"
        self.failures = 0
        self.opened_at: int | None = None
        self.probe_in_flight = False

    def failure(self, now: int) -> None:
        self.failures += 1
        if self.state == "half_open" or (self.state == "closed" and self.failures >= self.failure_threshold):
            self.state = "open"
            self.opened_at = now
            self.probe_in_flight = False

    def permit(self, now: int) -> bool:
        if self.state == "open" and self.opened_at is not None and now - self.opened_at >= self.reset_after:
            self.state = "half_open"
            self.probe_in_flight = True
            return True
        if self.state == "half_open":
            return False
        return self.state == "closed"

    def success(self) -> None:
        self.failures = 0
        self.state = "closed"
        self.opened_at = None
        self.probe_in_flight = False

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    print("full-jitter retry delays:", retry_delays(0.5, 2, 5, 4))
    print("transient retry:", should_retry("transient"), "business rule retry:", should_retry("business_rule"))
    breaker = CircuitBreaker(3, 30)
    for now in (1, 2, 3):
        breaker.failure(now)
    print("breaker:", breaker.state, "permit after reset:", breaker.permit(33), breaker.state)
    print("Seeded Full Jitter is for reproducible teaching output; production uses independent randomness and a shared retry budget.")

if __name__ == "__main__":
    main()
