# Course Content Contract v0.1

## Purpose
This contract defines the first version of the structured course content model used by the frontend. It is intentionally small and versionable; backend persistence and authoring workflows are out of scope for this phase.

## Entities
- Course: stable ID, title, description, version, locale and ordered modules.
- Module: stable MNN identifier, level, title, summary, prerequisites, learning objectives, lessons and optional lab identifier.
- Lesson: stable ID, title, summary, learning objectives, estimated duration and ordered content sections.
- LabDefinition (next schema revision): lab ID, execution mode, parameter schema, outputs, safety notes and evaluation contract.
- Assessment (next schema revision): assessment ID, question/task definition, scoring rubric and feedback.

## Validation
The current implementation uses Zod runtime schemas in `src/types/course.ts`. Invalid content must fail validation rather than silently render partial data. The course fixture is in `src/data/curriculum.ts`.

## Identifier rules
- Course IDs use stable kebab-case identifiers.
- Module IDs use M01 through M99.
- Lesson IDs are stable within the course and must not be derived from display titles at runtime.
- Lab IDs are stable integration identifiers, not presentation labels.

## Content rules
- Learning objectives must be observable and assessable.
- Prerequisites refer to existing module IDs.
- Lesson durations are positive integer minutes.
- Content sections are ordered and each has a heading and body.
- A lab must declare its execution mode before it is exposed to learners.

## Compatibility
Changes that remove or reinterpret fields require a schema version change and a migration note. Additive optional fields may be introduced in a minor version after tests are updated.

## Known limitations
The first schema revision does not yet model citations, source freshness, assessments, progress events, lab execution metadata or localized variants. These are planned extensions, not implemented features.
