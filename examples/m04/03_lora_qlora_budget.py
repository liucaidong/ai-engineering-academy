#!/usr/bin/env python3
"""Compare trainable LoRA parameters with a frozen quantized base-weight payload."""
from __future__ import annotations
import argparse

def lora_parameters(d_in: int, d_out: int, rank: int) -> int:
    if min(d_in, d_out, rank) <= 0:
        raise ValueError("dimensions and rank must be positive")
    return rank * (d_in + d_out)

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--d-in", type=int, default=4096)
    parser.add_argument("--d-out", type=int, default=4096)
    parser.add_argument("--rank", type=int, default=16)
    parser.add_argument("--base-parameters", type=float, default=7e9)
    parser.add_argument("--quant-bits", type=int, default=4)
    args = parser.parse_args()
    full = args.d_in * args.d_out
    adapter = lora_parameters(args.d_in, args.d_out, args.rank)
    quantized_payload_gb = args.base_parameters * args.quant_bits / 8 / 1e9
    print(f"Full matrix parameters: {full:,}")
    print(f"LoRA trainable parameters: {adapter:,}")
    print(f"Adapter/full-matrix ratio: {adapter / full:.4%}")
    print(f"Idealized {args.quant_bits}-bit base-weight payload: {quantized_payload_gb:.3f} GB")
    print("Not a total VRAM estimate: excludes metadata, non-quantized modules, adapter")
    print("gradients/optimizer, activations, temporary buffers, and framework overhead.")

if __name__ == "__main__":
    main()
