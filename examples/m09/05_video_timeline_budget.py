#!/usr/bin/env python3
"""Estimate video frame sampling, short-event coverage and timestamp alignment."""
from __future__ import annotations
import argparse
import math

def sampled_frame_count(duration_seconds: float, sample_fps: float) -> int:
    if duration_seconds < 0 or sample_fps <= 0:
        raise ValueError("duration must be non-negative and sample_fps positive")
    return math.ceil(duration_seconds * sample_fps)

def event_capture_probability(event_seconds: float, sample_interval_seconds: float) -> float:
    if event_seconds < 0 or sample_interval_seconds <= 0:
        raise ValueError("invalid event duration or sampling interval")
    return min(1.0, event_seconds / sample_interval_seconds)

def timestamps_aligned(left_seconds: float, right_seconds: float, tolerance_seconds: float) -> bool:
    if tolerance_seconds < 0:
        raise ValueError("tolerance cannot be negative")
    return abs(left_seconds - right_seconds) <= tolerance_seconds

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--duration", type=float, default=600)
    parser.add_argument("--fps", type=float, default=30)
    args = parser.parse_args()
    print(f"Original frames: {sampled_frame_count(args.duration, args.fps):,}")
    for sample_fps in (1, 2, 5, 10):
        frames = sampled_frame_count(args.duration, sample_fps)
        print(f"sample={sample_fps} fps: {frames:,} frames ({frames / max(sampled_frame_count(args.duration, args.fps), 1):.1%} of source frame count)")
    print("100ms event capture probability at 1fps under uniform random phase:", event_capture_probability(0.1, 1.0))
    print("This probability assumes ideal periodic point sampling and random event phase; it is not a benchmark result.")

if __name__ == "__main__":
    main()
