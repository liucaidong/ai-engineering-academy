#!/usr/bin/env python3
"""Numerical demonstrations of Bradley-Terry, PPO clipping, and DPO loss."""
from __future__ import annotations
import argparse
import math

def sigmoid(x: float) -> float:
    if x >= 0:
        z = math.exp(-x)
        return 1 / (1 + z)
    z = math.exp(x)
    return z / (1 + z)

def log_sigmoid(x: float) -> float:
    return -math.log1p(math.exp(-x)) if x >= 0 else x - math.log1p(math.exp(x))

def bradley_terry_probability(reward_winner: float, reward_loser: float) -> float:
    return sigmoid(reward_winner - reward_loser)

def ppo_clipped_surrogate(ratio: float, advantage: float, epsilon: float = 0.2) -> float:
    if ratio <= 0 or not 0 < epsilon < 1:
        raise ValueError("ratio must be positive and epsilon must be between 0 and 1")
    clipped = min(1 + epsilon, max(1 - epsilon, ratio))
    return min(ratio * advantage, clipped * advantage)

def dpo_loss(policy_logratio_w: float, policy_logratio_l: float, beta: float = 0.1) -> float:
    if beta <= 0:
        raise ValueError("beta must be positive")
    return -log_sigmoid(beta * (policy_logratio_w - policy_logratio_l))

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--reward-w", type=float, default=1.2)
    parser.add_argument("--reward-l", type=float, default=0.2)
    parser.add_argument("--ratio", type=float, default=1.35)
    parser.add_argument("--advantage", type=float, default=0.8)
    parser.add_argument("--logratio-w", type=float, default=0.7)
    parser.add_argument("--logratio-l", type=float, default=0.1)
    parser.add_argument("--beta", type=float, default=0.1)
    args = parser.parse_args()
    print(f"Bradley-Terry P(w preferred): {bradley_terry_probability(args.reward_w, args.reward_l):.4f}")
    print(f"PPO clipped surrogate: {ppo_clipped_surrogate(args.ratio, args.advantage):.4f}")
    print(f"DPO loss: {dpo_loss(args.logratio_w, args.logratio_l, args.beta):.4f}")
    print("Objective-level demonstrations only; not a complete RLHF training implementation.")

if __name__ == "__main__":
    main()
