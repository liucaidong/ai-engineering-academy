#!/usr/bin/env python3
"""Keep deterministic workflow transitions separate from Agent proposals."""
from __future__ import annotations
import argparse
import math

TRANSITIONS = {
    "received": {"validate": "validated", "reject": "rejected"},
    "validated": {"request_review": "awaiting_review", "reject": "rejected"},
    "awaiting_review": {"approve": "approved", "reject": "rejected", "expire": "expired"},
    "approved": {"pay": "paid"},
}

def validate_agent_proposal(proposal: dict[str, object]) -> list[str]:
    errors = []
    if proposal.get("kind") not in {"document_summary", "risk_label", "missing_information"}:
        errors.append("unsupported_agent_output_kind")
    refs = proposal.get("evidence_refs")
    if not isinstance(refs, list) or not refs or any(not isinstance(ref, str) or not ref for ref in refs):
        errors.append("evidence_refs_required")
    confidence = proposal.get("confidence")
    if isinstance(confidence, bool) or not isinstance(confidence, (int, float)) or not math.isfinite(confidence) or not 0 <= confidence <= 1:
        errors.append("invalid_confidence")
    return errors

def transition(state: str, event: str) -> str:
    if event not in TRANSITIONS.get(state, {}):
        raise ValueError("transition_not_allowed")
    return TRANSITIONS[state][event]

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    proposal = {"kind": "risk_label", "evidence_refs": ["document-17"], "confidence": 0.91}
    print("Agent proposal errors:", validate_agent_proposal(proposal))
    state = transition("received", "validate")
    state = transition(state, "request_review")
    print("workflow state:", state)
    print("Only a trusted approval event can advance awaiting_review to approved.")

if __name__ == "__main__":
    main()
