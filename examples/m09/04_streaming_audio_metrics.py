#!/usr/bin/env python3
"""Calculate raw PCM size, word error rate and a simple streaming latency budget."""
from __future__ import annotations
import argparse

def pcm_bytes(duration_seconds: float, sample_rate: int, bit_depth: int, channels: int = 1) -> int:
    if duration_seconds < 0 or min(sample_rate, bit_depth, channels) <= 0 or bit_depth % 8:
        raise ValueError("invalid PCM parameters")
    return round(duration_seconds * sample_rate * (bit_depth // 8) * channels)

def word_error_rate(substitutions: int, deletions: int, insertions: int, reference_words: int) -> float:
    if min(substitutions, deletions, insertions) < 0 or reference_words <= 0:
        raise ValueError("invalid edit counts or reference length")
    return (substitutions + deletions + insertions) / reference_words

def streaming_latency_ms(chunk_seconds: float, lookahead_seconds: float, processing_ms: float, endpoint_ms: float = 0) -> float:
    if min(chunk_seconds, lookahead_seconds, processing_ms, endpoint_ms) < 0 or chunk_seconds == 0:
        raise ValueError("chunk must be positive and delays non-negative")
    return chunk_seconds * 1000 + lookahead_seconds * 1000 + processing_ms + endpoint_ms

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--duration", type=float, default=60)
    args = parser.parse_args()
    size = pcm_bytes(args.duration, 16000, 16, 1)
    wer = word_error_rate(4, 3, 2, 100)
    latency = streaming_latency_ms(2, 0.2, 180, 250)
    print(f"PCM bytes: {size:,} ({size / 1_000_000:.2f} MB decimal)")
    print(f"WER: {wer:.1%}")
    print(f"Illustrative chunk-to-final latency budget: {latency:.0f} ms")
    print("Does not include codec/network variability, diarization or model-specific buffering.")

if __name__ == "__main__":
    main()
