#!/usr/bin/env python3
"""Calculate task-quality SLI, error budget and multi-window burn-rate alerts."""
from __future__ import annotations
import argparse
import math

def sli(good_events: int, total_events: int) -> float:
    if type(good_events) is not int or type(total_events) is not int or total_events <= 0 or not 0 <= good_events <= total_events:
        raise ValueError("invalid integer event counts")
    return good_events / total_events

def error_budget_remaining(slo_target: float, observed_sli: float) -> float:
    if (any(isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value) for value in (slo_target, observed_sli))
            or not 0 < slo_target <= 1 or not 0 <= observed_sli <= 1):
        raise ValueError("finite targets must be in [0, 1]")
    allowed_bad = 1 - slo_target
    actual_bad = 1 - observed_sli
    if allowed_bad == 0:
        return 1.0 if actual_bad == 0 else 0.0
    return max(0.0, min(1.0, (allowed_bad - actual_bad) / allowed_bad))

def burn_rate(observed_error_rate: float, allowed_error_rate: float) -> float:
    if (any(isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value) for value in (observed_error_rate, allowed_error_rate))
            or not 0 <= observed_error_rate <= 1 or not 0 < allowed_error_rate <= 1):
        raise ValueError("invalid finite error rates")
    return observed_error_rate / allowed_error_rate

def multi_window_alert(long_burn: float, short_burn: float, threshold: float) -> bool:
    values = (long_burn, short_burn, threshold)
    if any(isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value) for value in values) or min(values) < 0:
        raise ValueError("burn rates and threshold must be finite and non-negative")
    return long_burn >= threshold and short_burn >= threshold

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    quality = sli(985, 1000)
    remaining = error_budget_remaining(0.99, quality)
    burn = burn_rate(0.015, 0.01)
    print("quality SLI:", quality, "error budget remaining:", remaining)
    print("burn rate:", burn, "alert:", multi_window_alert(burn, 2.0, 1.5))
    print("Safety hard constraints must be monitored separately from aggregate quality SLOs.")

if __name__ == "__main__":
    main()
