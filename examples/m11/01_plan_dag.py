#!/usr/bin/env python3
"""Validate a small action DAG and check action preconditions."""
from __future__ import annotations
import argparse
from collections import deque

def topological_order(nodes: list[str], edges: list[tuple[str, str]]) -> list[str]:
    node_set = set(nodes)
    if len(node_set) != len(nodes):
        raise ValueError("duplicate node IDs")
    indegree = {node: 0 for node in nodes}
    outgoing = {node: [] for node in nodes}
    for source, target in edges:
        if source not in node_set or target not in node_set:
            raise ValueError("edge references unknown node")
        outgoing[source].append(target)
        indegree[target] += 1
    queue = deque(node for node in nodes if indegree[node] == 0)
    result = []
    while queue:
        node = queue.popleft()
        result.append(node)
        for target in outgoing[node]:
            indegree[target] -= 1
            if indegree[target] == 0:
                queue.append(target)
    if len(result) != len(nodes):
        raise ValueError("dependency cycle detected")
    return result

def validate_plan(actions: list[dict[str, object]], initial_state: set[str]) -> dict[str, object]:
    state = set(initial_state)
    executed = []
    for action in actions:
        missing = set(action["preconditions"]) - state
        if missing:
            return {"valid": False, "blocked_action": action["id"], "missing_preconditions": sorted(missing), "executed": executed}
        state.update(action["effects"])
        executed.append(str(action["id"]))
    return {"valid": True, "executed": executed, "final_state": sorted(state)}

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    nodes = ["collect", "screen", "finance", "report", "approve"]
    edges = [("collect", "screen"), ("collect", "finance"), ("screen", "report"), ("finance", "report"), ("report", "approve")]
    print("DAG order:", topological_order(nodes, edges))
    actions = [
        {"id": "collect", "preconditions": ["vendor_known"], "effects": ["documents_collected"]},
        {"id": "screen", "preconditions": ["documents_collected"], "effects": ["risk_screened"]},
        {"id": "report", "preconditions": ["risk_screened"], "effects": ["report_ready"]},
    ]
    print("Plan validation:", validate_plan(actions, {"vendor_known"}))
    print("Toy state validation; no PDDL parser or optimal planner is executed.")

if __name__ == "__main__":
    main()
