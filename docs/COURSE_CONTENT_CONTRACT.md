# Course Content Contract v0.2

## Purpose
Defines the versioned content model consumed by the academy frontend. The current contract is a typed authoring and validation boundary; it is not yet a CMS or a persisted backend schema.

## Entities
- Course: stable ID, title, description, semantic content version, locale, ordered modules and lab registry.
- Module: stable MNN identifier, level, summary, prerequisite module IDs, measurable objectives, lessons and optional lab ID.
- Lesson: stable ID, title, summary, measurable objectives, estimated duration, ordered sections, source references and assessments.
- Content section: heading, required plain-text fallback, optional Markdown source and optional section-level source references.
- Source reference: title, canonical URL, optional publisher, access date and editorial note.
- Lab definition: stable ID, explicit execution mode, description, safety notes, input/output descriptions and implementation status.
- Assessment: stable ID, type, prompt and rubric criteria with positive point values.

## Execution modes
- `simulation`: deterministic or illustrative teaching simulation; no external side effects.
- `browser-local`: computation runs in the learner's browser; no server execution implied.
- `server-sandbox`: isolated server-side execution; must not be claimed until an actual sandbox exists.
- `provider-backed`: external model/service calls; requires credentials, quota, privacy and approval controls.

The UI must never infer an execution mode from the lab name. The registry is authoritative.

## Validation invariants
- Module IDs follow MNN and are unique within a course.
- Lesson IDs are unique across the entire course.\n- Assessment IDs are unique across the entire course; rubric criterion names are unique within each assessment.
- Prerequisite IDs must exist, cannot repeat, cannot self-reference and must form a directed acyclic graph.
- Lab IDs are unique. When a lab registry is present, each module lab reference must resolve.
- Learning objectives and lesson sections are non-empty.
- Assessment rubric points are positive.
- Source URLs must be valid absolute URLs.

## Markdown safety
Lesson Markdown is rendered with `react-markdown` and `remark-gfm`. Raw HTML is not enabled; no `rehype-raw` plugin is installed. Content authors must use Markdown rather than embedded HTML.

## Compatibility
The schema uses additive optional fields where possible. Contract changes that reinterpret persisted data require an explicit version and migration note. Course content version is separate from application package version.

## Learner progress\n- The frontend stores completed module IDs in a versioned browser-local `localStorage` key.\n- Invalid, stale or unavailable storage is ignored safely; learning remains usable in private browsing or restricted storage contexts.\n- This is not account-level persistence, cross-device synchronization or a server-side record.\n\n## Assessment response storage\n- Assessment drafts and rubric self-review are stored under a versioned browser-local key.\n- Self-review points indicate learner checklist progress only; they are not an instructor grade or automated model score.\n- The current implementation has no account identity, server synchronization, or cross-device history.\n\n## Current limitations
The registry and schemas exist, but assessment authoring, citations, learner progress persistence, server sandboxing, provider-backed execution and content version migration tooling are not yet implemented. Most modules still contain concise scaffold content rather than complete instructional material.
