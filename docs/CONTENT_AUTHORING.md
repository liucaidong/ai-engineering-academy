# Course Content Authoring and Schema Migration

## Canonical ownership
The curriculum is authored in `src/data/curriculum.ts`. The runtime contract is defined in `src/types/course.ts`. Do not duplicate the canonical course structure in UI components.

## Authoring a module
1. Use a stable module ID in the `MNN` format and a globally unique lesson ID.
2. Keep prerequisites explicit. Every prerequisite must reference an existing module, and the prerequisite graph must remain acyclic.
3. Write at least three substantive content sections. Each section requires a plain-text `body`; optional Markdown may add lists, emphasis and links. Raw HTML is not supported.
4. Add at least two source references to the lesson. Prefer primary papers, standards and official documentation. Include publisher and a short note describing why the source is relevant.
5. Add at least one assessment with a globally unique ID and a rubric whose criteria are unique within that assessment.
6. If a module has a lab, register it in the course lab registry. Declare execution mode, inputs, outputs and explicit safety notes. Never mark a planned lab as implemented until its UI and tests exist.
7. Add or update tests that cover content, sources, assessments, prerequisite behavior and unknown-field rejection.
8. Keep imported JSON within the 2 MiB UTF-8 authoring limit; the browser editor stores drafts locally and exports only schema-valid payloads.

## Versioning
- `version` is the curriculum content release version (SemVer).
- `schemaVersion` is the structural data contract version.
- Content-only edits bump `version`; structural changes bump `schemaVersion` and require a migration.
- The current migration adds `schemaVersion: 1` to legacy payloads that predate the field.
- Unknown schema versions are rejected. Do not silently discard fields or guess how to transform future schemas.

## Validation commands
```bash
npm run validate:course
npm test
npm run build
npm run test:e2e
```

## Review checklist
- Claims are supported by source references.
- Examples are labeled as illustrative when they are not production implementations.
- Simulation and browser-local execution are not described as provider-backed or server-sandboxed.
- Tool permissions and external side effects are explicit.
- All IDs are unique and all prerequisite references resolve.
- Course version and schema version are updated according to the rules above.
