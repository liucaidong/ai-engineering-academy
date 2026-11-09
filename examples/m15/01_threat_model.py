#!/usr/bin/env python3
"""Map AI/Agent threat techniques to STRIDE and prioritize scenarios."""
from __future__ import annotations
import argparse

STRIDE = {"spoofing", "tampering", "repudiation", "information_disclosure", "denial_of_service", "elevation_of_privilege"}
TECHNIQUE_MAP = {
    "prompt_injection": {"tampering", "elevation_of_privilege"},
    "context_poisoning": {"tampering"},
    "tool_invocation_abuse": {"elevation_of_privilege", "information_disclosure"},
    "credential_exposure": {"information_disclosure", "spoofing"},
    "agent_loop": {"denial_of_service"},
    "audit_log_tampering": {"repudiation", "tampering"},
}

def risk_score(likelihood: int, impact: int) -> tuple[int, str]:
    if not 1 <= likelihood <= 5 or not 1 <= impact <= 5:
        raise ValueError("likelihood and impact must be in [1, 5]")
    score = likelihood * impact
    level = "low" if score <= 4 else "moderate" if score <= 9 else "high" if score <= 16 else "critical"
    return score, level

def map_technique(technique: str) -> set[str]:
    if technique not in TECHNIQUE_MAP:
        raise ValueError("unknown technique")
    return TECHNIQUE_MAP[technique] & STRIDE

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    for technique in TECHNIQUE_MAP:
        print(technique, sorted(map_technique(technique)))
    print("risk:", risk_score(4, 5))
    print("STRIDE mapping is an analysis aid, not a complete threat model.")

if __name__ == "__main__":
    main()
