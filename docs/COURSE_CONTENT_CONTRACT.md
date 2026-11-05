# Course Content Contract v0.3

## Purpose
Defines the versioned content model consumed by the academy frontend. It is a typed authoring and validation boundary, not yet a CMS or persisted backend schema.

## Entities
- Course: stable ID, schema version, content version, locale, ordered modules and lab registry.
- Module: stable MNN identifier, level, summary, prerequisite module IDs, measurable objectives, lessons and optional lab ID.
- Lesson: stable ID, title, summary, measurable objectives, estimated duration, ordered sections, source references and assessments.
- Content section: heading, required plain-text fallback, optional Markdown source and optional section-level source references.
- Source reference: title, canonical URL, optional publisher, access date and editorial note.
- Lab definition: stable ID, explicit execution mode, description, safety notes, input/output descriptions and implementation status.
- Assessment: stable ID, type, prompt and rubric criteria with positive point values.

## Schema versioning
- `schemaVersion` identifies the structural contract; `version` identifies the published curriculum content.
- Legacy payloads without `schemaVersion` are migrated to schema version 1 only.
- Unknown future versions fail closed. Structural changes require an explicit migration and fixture tests.

## Execution modes
- `simulation`: deterministic or illustrative teaching simulation; no external side effects.
- `browser-local`: computation runs in the learner's browser; no server execution implied.
- `server-sandbox`: isolated server-side execution; must not be claimed until an actual sandbox exists.
- `provider-backed`: external model/service calls; requires credentials, quota, privacy and approval controls.

The UI must never infer an execution mode from the lab name. The registry is authoritative.

## Validation invariants
- Module IDs follow MNN and are unique within a course.
- Lesson IDs are unique across the entire course.
- Assessment IDs are unique across the entire course; rubric criterion names are unique within each assessment.
- Prerequisite IDs must exist, cannot repeat, cannot self-reference and must form a directed acyclic graph.
- Lab IDs are unique. When a lab registry is present, each module lab reference must resolve.
- Learning objectives and lesson sections are non-empty.
- Assessment rubric points are positive.
- Source URLs must be valid absolute URLs.

## Markdown safety
Lesson Markdown is rendered with `react-markdown` and `remark-gfm`. Raw HTML is not enabled; no `rehype-raw` plugin is installed. Content authors must use Markdown rather than embedded HTML.

## Learner progress
- Completed module IDs are stored in a versioned browser-local `localStorage` key.
- Invalid, stale or unavailable storage is ignored safely.
- This is not account-level persistence, cross-device synchronization or a server-side record.

## Assessment response storage
- Assessment drafts and rubric self-review are stored under a versioned browser-local key.
- Self-review points indicate learner checklist progress only; they are not an instructor grade or automated model score.
- The current implementation has no account identity, server synchronization or cross-device history.

## Current limitations
The current contract has a version-1 migration for legacy payloads without `schemaVersion`. It is not yet a CMS or a persisted backend schema. Runtime build and browser acceptance remain pending.
