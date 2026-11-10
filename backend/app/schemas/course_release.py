"""Strict validation for immutable course release snapshots.

This mirrors src/types/course.ts. The browser exporter validates with the
canonical Zod schema before producing JSON; the backend validates again at the
publication trust boundary and rejects unknown fields.
"""

from __future__ import annotations

from typing import Annotated, Any, Literal
from urllib.parse import urlsplit

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    StrictInt,
    StrictStr,
    field_validator,
    model_validator,
)


class StrictSchema(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)

    @model_validator(mode="before")
    @classmethod
    def reject_explicit_nulls(cls, value: object) -> object:
        def visit(item: object, path: str) -> None:
            if item is None:
                raise ValueError(f"{path or 'value'} must not be null")
            if isinstance(item, dict):
                for key, nested in item.items():
                    visit(nested, f"{path}.{key}" if path else str(key))
            elif isinstance(item, list):
                for index, nested in enumerate(item):
                    visit(nested, f"{path}[{index}]")

        visit(value, "")
        return value


class SourceReference(StrictSchema):
    title: StrictStr = Field(min_length=1)
    url: StrictStr = Field(min_length=1)
    publisher: StrictStr | None = None
    accessedAt: StrictStr | None = None
    note: StrictStr | None = None

    @field_validator("url")
    @classmethod
    def validate_absolute_url(cls, value: str) -> str:
        parsed = urlsplit(value)
        if not parsed.scheme or (parsed.scheme in {"http", "https"} and not parsed.netloc):
            raise ValueError("url must be an absolute URL")
        return value

    @field_validator("accessedAt")
    @classmethod
    def validate_accessed_at(cls, value: str | None) -> str | None:
        if value is not None:
            from datetime import date

            if len(value) != 10 or value[4] != "-" or value[7] != "-":
                raise ValueError("accessedAt must use YYYY-MM-DD")
            date.fromisoformat(value)
        return value


class RubricCriterion(StrictSchema):
    criterion: StrictStr = Field(min_length=1)
    description: StrictStr = Field(min_length=1)
    points: float = Field(gt=0)


class Assessment(StrictSchema):
    id: StrictStr = Field(min_length=1)
    type: Literal["knowledge-check", "code-task", "design-review", "reflection"]
    prompt: StrictStr = Field(min_length=1)
    rubric: list[RubricCriterion] = Field(min_length=1)

    @model_validator(mode="after")
    def unique_criteria(self) -> Assessment:
        values = [item.criterion for item in self.rubric]
        if len(values) != len(set(values)):
            raise ValueError("assessment rubric criterion names must be unique")
        return self


class LabInputOutput(StrictSchema):
    name: StrictStr = Field(min_length=1)
    description: StrictStr = Field(min_length=1)


class LabDefinition(StrictSchema):
    id: StrictStr = Field(min_length=1)
    title: StrictStr = Field(min_length=1)
    executionMode: Literal["simulation", "browser-local", "server-sandbox", "provider-backed"]
    description: StrictStr = Field(min_length=1)
    safetyNotes: list[Annotated[StrictStr, Field(min_length=1)]] = Field(min_length=1)
    inputs: list[LabInputOutput] = Field(default_factory=list)
    outputs: list[LabInputOutput] = Field(default_factory=list)
    status: Literal["planned", "implemented", "beta"] = "planned"


class LessonContent(StrictSchema):
    heading: StrictStr = Field(min_length=1)
    body: StrictStr = Field(min_length=1)
    markdown: StrictStr | None = None
    sources: list[SourceReference] | None = None


class Lesson(StrictSchema):
    id: StrictStr = Field(min_length=1)
    title: StrictStr = Field(min_length=1)
    summary: StrictStr = Field(min_length=1)
    learningObjectives: list[StrictStr] = Field(min_length=1)
    estimatedMinutes: StrictInt = Field(gt=0)
    content: list[LessonContent] = Field(min_length=3)

    @field_validator("estimatedMinutes", mode="before")
    @classmethod
    def normalize_integral_json_number(cls, value: object) -> object:
        if isinstance(value, float) and value.is_integer():
            return int(value)
        return value

    assessments: list[Assessment] = Field(min_length=1)
    sources: list[SourceReference] = Field(min_length=2)


class CourseModule(StrictSchema):
    id: StrictStr = Field(pattern=r"^M\d{2}$")
    level: Literal["L1", "L2", "L3", "L4", "L5", "L6"]
    title: StrictStr = Field(min_length=1)
    summary: StrictStr = Field(min_length=1)
    prerequisites: list[StrictStr]
    objectives: list[StrictStr] = Field(min_length=1)
    lessons: list[Lesson] = Field(min_length=1)
    labId: StrictStr | None = None


class CourseSnapshot(StrictSchema):
    schemaVersion: Literal[1]
    id: StrictStr = Field(min_length=1)
    title: StrictStr = Field(min_length=1)
    description: StrictStr = Field(min_length=1)
    version: StrictStr = Field(pattern=r"^\d+\.\d+\.\d+$")
    language: StrictStr = Field(min_length=2)
    modules: list[CourseModule] = Field(min_length=1)
    labs: list[LabDefinition] = Field(default_factory=list)

    @field_validator("schemaVersion", mode="before")
    @classmethod
    def normalize_schema_version(cls, value: object) -> object:
        if isinstance(value, float) and value.is_integer():
            return int(value)
        return value

    @model_validator(mode="after")
    def validate_course_graph(self) -> CourseSnapshot:
        module_ids = [module.id for module in self.modules]
        if len(module_ids) != len(set(module_ids)):
            raise ValueError("module IDs must be unique")
        known_modules = set(module_ids)

        lesson_ids: set[str] = set()
        assessment_ids: set[str] = set()
        for module in self.modules:
            if len(module.prerequisites) != len(set(module.prerequisites)):
                raise ValueError(f"duplicate prerequisites in module {module.id}")
            for dependency in module.prerequisites:
                if dependency == module.id:
                    raise ValueError(f"module {module.id} cannot depend on itself")
                if dependency not in known_modules:
                    raise ValueError(f"unknown prerequisite module: {dependency}")
            for lesson in module.lessons:
                if lesson.id in lesson_ids:
                    raise ValueError(f"duplicate course lesson ID: {lesson.id}")
                lesson_ids.add(lesson.id)
                for assessment in lesson.assessments:
                    if assessment.id in assessment_ids:
                        raise ValueError(f"duplicate assessment ID: {assessment.id}")
                    assessment_ids.add(assessment.id)

        state: dict[str, str] = {}

        def visit(module_id: str, stack: tuple[str, ...]) -> None:
            if state.get(module_id) == "visited":
                return
            if state.get(module_id) == "visiting":
                raise ValueError(f"prerequisite cycle detected: {' -> '.join((*stack, module_id))}")
            state[module_id] = "visiting"
            module = next(item for item in self.modules if item.id == module_id)
            for dependency in module.prerequisites:
                visit(dependency, (*stack, module_id))
            state[module_id] = "visited"

        for module_id in module_ids:
            visit(module_id, ())

        lab_ids = [lab.id for lab in self.labs]
        if len(lab_ids) != len(set(lab_ids)):
            raise ValueError("lab IDs must be unique")
        if self.labs:
            known_labs = set(lab_ids)
            for module in self.modules:
                if module.labId is not None and module.labId not in known_labs:
                    raise ValueError(f"unknown lab ID: {module.labId}")
        return self


def validate_course_snapshot(value: object) -> CourseSnapshot:
    """Validate and normalize a complete version-1 course snapshot."""
    return CourseSnapshot.model_validate(value, strict=True)


def course_snapshot_dict(snapshot: CourseSnapshot) -> dict[str, Any]:
    """Return JSON-compatible content with defaults materialized."""
    return snapshot.model_dump(mode="json", exclude_none=True)
