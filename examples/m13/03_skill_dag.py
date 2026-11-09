#!/usr/bin/env python3
"""Validate Skill dependency graphs and return a topological execution order."""
from __future__ import annotations
import argparse
from collections import deque

def topological_order(graph: dict[str, list[str]]) -> list[str]:
    nodes = set(graph)
    for dependencies in graph.values():
        nodes.update(dependencies)
    missing = nodes - set(graph)
    if missing:
        raise ValueError(f"undefined skill nodes: {sorted(missing)}")
    indegree = {node: 0 for node in nodes}
    outgoing = {node: [] for node in nodes}
    for node, dependencies in graph.items():
        for dependency in dependencies:
            outgoing[dependency].append(node)
            indegree[node] += 1
    ready = deque(sorted(node for node, degree in indegree.items() if degree == 0))
    order: list[str] = []
    while ready:
        node = ready.popleft()
        order.append(node)
        for child in sorted(outgoing[node]):
            indegree[child] -= 1
            if indegree[child] == 0:
                ready.append(child)
    if len(order) != len(nodes):
        raise ValueError("skill dependency cycle detected")
    return order

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    graph = {
        "requirements": [],
        "implementation": ["requirements"],
        "tests": ["implementation"],
        "security-review": ["implementation"],
        "release-notes": ["tests", "security-review"],
    }
    print("execution order:", topological_order(graph))
    print("DAG order does not validate input/output Schema compatibility or permissions.")

if __name__ == "__main__":
    main()
