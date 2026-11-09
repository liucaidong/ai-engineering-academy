#!/usr/bin/env python3
"""Compute agent security metrics and validate an incident response sequence."""
from __future__ import annotations
import argparse

INCIDENT_STAGES = ["detected", "triaged", "contained", "evidence_preserved", "credentials_revoked", "quarantined", "scoped", "recovered", "notified", "reviewed"]
CORE_STAGES = ["detected", "triaged", "contained", "scoped", "recovered", "reviewed"]

def rate(numerator: int, denominator: int) -> float:
    if denominator <= 0 or not 0 <= numerator <= denominator:
        raise ValueError("invalid numerator/denominator")
    return numerator / denominator

def incident_sequence_valid(stages: list[str]) -> bool:
    """Validate this exercise checklist, not a mandatory universal IR sequence."""
    if not stages or any(stage not in INCIDENT_STAGES for stage in stages):
        return False
    if len(stages) != len(set(stages)) or not set(CORE_STAGES).issubset(stages):
        return False
    positions = {stage: stages.index(stage) for stage in stages}
    if [positions[stage] for stage in CORE_STAGES] != sorted(positions[stage] for stage in CORE_STAGES):
        return False
    for stage in ("evidence_preserved", "credentials_revoked", "quarantined"):
        if stage in positions and not positions["triaged"] < positions[stage] < positions["recovered"]:
            return False
    if "notified" in positions and not positions["triaged"] < positions["notified"] < positions["reviewed"]:
        return False
    return True

def mean_time_to_contain(detected_at: list[float], contained_at: list[float]) -> float:
    if len(detected_at) != len(contained_at) or not detected_at:
        raise ValueError("timestamps must be non-empty and aligned")
    durations = [end - start for start, end in zip(detected_at, contained_at)]
    if any(duration < 0 for duration in durations):
        raise ValueError("containment cannot precede detection")
    return sum(durations) / len(durations)

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    print("attack success rate:", rate(2, 40))
    print("unauthorized execution rate:", rate(0, 40))
    print("mean time to contain:", mean_time_to_contain([1, 5], [4, 10]))
    print("response sequence valid:", incident_sequence_valid(INCIDENT_STAGES))
    print("Metric denominators and test-case labels must be documented.")

if __name__ == "__main__":
    main()
