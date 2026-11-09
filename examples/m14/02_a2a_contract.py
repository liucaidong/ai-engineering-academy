#!/usr/bin/env python3
"""Validate a minimal A2A-style Agent Card, Task, Message and Artifact model."""
from __future__ import annotations
import argparse

CORE_BINDINGS = {"JSONRPC", "GRPC", "HTTP+JSON"}
TASK_STATES = {
    "TASK_STATE_UNSPECIFIED",
    "TASK_STATE_SUBMITTED",
    "TASK_STATE_WORKING",
    "TASK_STATE_COMPLETED",
    "TASK_STATE_FAILED",
    "TASK_STATE_CANCELED",
    "TASK_STATE_INPUT_REQUIRED",
    "TASK_STATE_REJECTED",
    "TASK_STATE_AUTH_REQUIRED",
}
MESSAGE_ROLES = {"ROLE_USER", "ROLE_AGENT"}
PART_FIELDS = {"text", "raw", "url", "data"}


def validate_part(part: dict[str, object]) -> list[str]:
    present = [key for key in PART_FIELDS if key in part and part[key] is not None]
    return [] if len(present) == 1 else ["part_must_have_exactly_one_content_field"]


def validate_agent_card(card: dict[str, object]) -> list[str]:
    errors = []
    required = (
        "name", "description", "supportedInterfaces", "version", "capabilities",
        "defaultInputModes", "defaultOutputModes", "skills",
    )
    for field in required:
        if field not in card:
            errors.append(f"missing_{field}")
    interfaces = card.get("supportedInterfaces")
    if not isinstance(interfaces, list) or not interfaces:
        errors.append("supported_interfaces_must_be_non_empty_list")
    else:
        for index, interface in enumerate(interfaces):
            if not isinstance(interface, dict):
                errors.append(f"interface_{index}_must_be_object")
                continue
            for field in ("url", "protocolBinding", "protocolVersion"):
                if not isinstance(interface.get(field), str) or not interface[field]:
                    errors.append(f"interface_{index}_missing_{field}")
            binding = interface.get("protocolBinding")
            if binding and binding not in CORE_BINDINGS:
                errors.append(f"interface_{index}_unsupported_core_binding")
    for field in ("defaultInputModes", "defaultOutputModes", "skills"):
        if field in card and not isinstance(card[field], list):
            errors.append(f"{field}_must_be_list")
    if "capabilities" in card and not isinstance(card["capabilities"], dict):
        errors.append("capabilities_must_be_object")
    return errors


def validate_task(task: dict[str, object]) -> list[str]:
    errors = []
    if not isinstance(task.get("id"), str) or not task.get("id"):
        errors.append("task_id_required")
    status = task.get("status")
    if not isinstance(status, dict) or status.get("state") not in TASK_STATES:
        errors.append("invalid_task_status_state")
    artifacts = task.get("artifacts", [])
    if not isinstance(artifacts, list):
        errors.append("task_artifacts_must_be_list")
    return errors


def validate_message(message: dict[str, object]) -> list[str]:
    errors = []
    if not isinstance(message.get("messageId"), str) or not message.get("messageId"):
        errors.append("message_id_required")
    if message.get("role") not in MESSAGE_ROLES:
        errors.append("invalid_message_role")
    parts = message.get("parts")
    if not isinstance(parts, list) or not parts:
        errors.append("message_parts_required")
    else:
        for index, part in enumerate(parts):
            if not isinstance(part, dict):
                errors.append(f"message_part_{index}_must_be_object")
            else:
                errors.extend(validate_part(part))
    return errors


def validate_artifact(artifact: dict[str, object]) -> list[str]:
    errors = []
    if not isinstance(artifact.get("artifactId"), str) or not artifact.get("artifactId"):
        errors.append("artifact_id_required")
    parts = artifact.get("parts")
    if not isinstance(parts, list) or not parts:
        errors.append("artifact_parts_required")
    else:
        for index, part in enumerate(parts):
            if not isinstance(part, dict):
                errors.append(f"artifact_part_{index}_must_be_object")
            else:
                errors.extend(validate_part(part))
    return errors

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    card = {"name": "Research Agent", "description": "Research and cite sources", "supportedInterfaces": [{"url": "https://agent.example/a2a", "protocolBinding": "HTTP+JSON", "protocolVersion": "1.0"}], "version": "1.0.0", "capabilities": {"streaming": True}, "defaultInputModes": ["text/plain"], "defaultOutputModes": ["text/plain"], "skills": [{"id": "research"}]}
    task = {"id": "task-123", "status": {"state": "TASK_STATE_WORKING"}}
    message = {"messageId": "msg-123", "role": "ROLE_USER", "parts": [{"text": "Compare three vendors"}]}
    artifact = {"artifactId": "report-001", "parts": [{"text": "Evidence-backed report"}]}
    print("Agent Card:", validate_agent_card(card))
    print("Task:", validate_task(task), "Message:", validate_message(message), "Artifact:", validate_artifact(artifact))
    print("A2A v1.0.1 field-shape teaching validator only; not a complete protocol conformance implementation.")

if __name__ == "__main__":
    main()
