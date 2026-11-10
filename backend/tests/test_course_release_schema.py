from copy import deepcopy

import pytest
from pydantic import ValidationError

from app.schemas.course_release import validate_course_snapshot


def valid_snapshot() -> dict:
    source = {"title": "Primary source", "url": "https://example.org/source"}
    return {
        "schemaVersion": 1,
        "id": "course",
        "title": "Course",
        "description": "A validated course snapshot",
        "version": "1.2.3",
        "language": "zh-CN",
        "labs": [
            {
                "id": "lab",
                "title": "Lab",
                "executionMode": "simulation",
                "description": "A deterministic lab",
                "safetyNotes": ["No external execution"],
                "inputs": [],
                "outputs": [],
                "status": "implemented",
            }
        ],
        "modules": [
            {
                "id": "M01",
                "level": "L1",
                "title": "Module",
                "summary": "Summary",
                "prerequisites": [],
                "objectives": ["Objective"],
                "labId": "lab",
                "lessons": [
                    {
                        "id": "L01",
                        "title": "Lesson",
                        "summary": "Lesson summary",
                        "learningObjectives": ["Objective"],
                        "estimatedMinutes": 30,
                        "content": [
                            {"heading": "A", "body": "Body"},
                            {"heading": "B", "body": "Body"},
                            {"heading": "C", "body": "Body", "sources": [source]},
                        ],
                        "assessments": [
                            {
                                "id": "A01",
                                "type": "knowledge-check",
                                "prompt": "Question",
                                "rubric": [
                                    {
                                        "criterion": "accuracy",
                                        "description": "Correct answer",
                                        "points": 1,
                                    }
                                ],
                            }
                        ],
                        "sources": [
                            source,
                            {"title": "Second source", "url": "https://example.org/2"},
                        ],
                    }
                ],
            }
        ],
    }


def test_accepts_complete_course_snapshot() -> None:
    snapshot = validate_course_snapshot(valid_snapshot())
    assert snapshot.version == "1.2.3"
    assert len(snapshot.modules) == 1
    assert len(snapshot.modules[0].lessons) == 1


@pytest.mark.parametrize(
    ("mutate", "message"),
    [
        (lambda data: data.update({"unexpected": True}), "Extra inputs"),
        (lambda data: data["modules"][0].update({"unknown": "field"}), "Extra inputs"),
        (
            lambda data: data["modules"][0]["lessons"][0]["content"][0].update({"body": None}),
            "must not be null",
        ),
        (
            lambda data: data["modules"][0]["lessons"][0]["assessments"][0].update(
                {"type": "exam"}
            ),
            "Input should be",
        ),
        (
            lambda data: data["modules"][0].update({"prerequisites": ["M99"]}),
            "unknown prerequisite",
        ),
        (lambda data: data["modules"][0].update({"labId": "missing"}), "unknown lab ID"),
        (
            lambda data: data["modules"][0]["lessons"][0]["sources"][0].update(
                {"url": "not a URL"}
            ),
            "absolute URL",
        ),
    ],
)
def test_rejects_invalid_or_unknown_snapshot_data(mutate, message: str) -> None:
    payload = valid_snapshot()
    mutate(payload)
    with pytest.raises((ValidationError, ValueError), match=message):
        validate_course_snapshot(payload)


def test_rejects_prerequisite_cycles() -> None:
    payload = valid_snapshot()
    second = deepcopy(payload["modules"][0])
    second.update({"id": "M02", "prerequisites": ["M01"], "labId": "lab"})
    payload["modules"][0]["prerequisites"] = ["M02"]
    payload["modules"].append(second)
    payload["modules"][1]["lessons"][0]["id"] = "L02"
    payload["modules"][1]["lessons"][0]["assessments"][0]["id"] = "A02"
    with pytest.raises(ValueError, match="cycle"):
        validate_course_snapshot(payload)


def test_rejects_duplicate_course_wide_lesson_and_assessment_ids() -> None:
    payload = valid_snapshot()
    second = deepcopy(payload["modules"][0])
    second.update({"id": "M02", "prerequisites": [], "labId": "lab"})
    payload["modules"].append(second)
    with pytest.raises(ValueError, match="duplicate course lesson"):
        validate_course_snapshot(payload)


def test_accepts_integral_json_floats_as_javascript_numbers() -> None:
    payload = valid_snapshot()
    payload["schemaVersion"] = 1.0
    payload["modules"][0]["lessons"][0]["estimatedMinutes"] = 30.0
    snapshot = validate_course_snapshot(payload)
    assert snapshot.schemaVersion == 1
    assert snapshot.modules[0].lessons[0].estimatedMinutes == 30
