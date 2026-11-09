#!/usr/bin/env python3
"""Check a simplified workflow command sequence against recorded history; not a Temporal SDK replay."""
from __future__ import annotations
import argparse

def replay_compatible(history: list[str], generated_commands: list[str]) -> bool:
    if len(generated_commands) < len(history):
        return False
    return generated_commands[: len(history)] == history

def workflow_commands(version: str) -> list[str]:
    if version in {"v1", "v2-existing-v1"}:
        return ["activity:validate", "timer:wait-for-approval", "activity:pay"]
    if version in {"v2-unsafe", "v2-new"}:
        return ["activity:validate", "activity:notify", "timer:wait-for-approval", "activity:pay"]
    raise ValueError("unsupported workflow version")

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    history = workflow_commands("v1")
    print("v1 replay:", replay_compatible(history, workflow_commands("v1")))
    print("unsafe v2 replay:", replay_compatible(history, workflow_commands("v2-unsafe")))
    print("version-routed existing v1 replay:", replay_compatible(history, workflow_commands("v2-existing-v1")))
    print("new v2 execution:", workflow_commands("v2-new"))
    print("Replay compatibility is a command-history check, not a full Temporal test.")

if __name__ == "__main__":
    main()
