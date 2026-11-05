# Engineering Acceptance Checklist

## Scope

This checklist covers the current frontend foundation. It distinguishes repository implementation from runtime acceptance. A checked source-code item does not imply that a browser or production build has been executed.

## Repository and build

Run from a clean clone with Node.js >= 20.19:

```bash
npm install
npm test
npm run validate:course
npm run build
npx playwright install chromium
npm run test:e2e
npm run dev
```

Acceptance evidence to retain:
- Node and npm versions;
- install output and dependency resolution result;
- complete Vitest summary;
- TypeScript and Vite production build output;
- browser and operating-system versions used for manual checks.

## Course contract

- [ ] The 20 modules load without schema warnings.
- [ ] `npm run test:e2e` passes all browser scenarios.
- [ ] Every module has at least one lesson, three or more content sections, two source references and one rubric assessment.
- [ ] Duplicate module, lesson, assessment and rubric criterion identifiers are rejected.
- [ ] Unknown, repeated, self-referential and cyclic prerequisites are rejected.
- [ ] Unknown lab references are rejected when a lab registry is supplied.
- [ ] Source URLs pass Zod URL validation.
- [ ] Legacy payloads migrate to schemaVersion 1 and unsupported versions are rejected.

## Learning workflow

- [ ] Bookmark and unbookmark a module, refresh, and confirm persistence.
- [ ] Filter the curriculum to bookmarked modules.
- [ ] Confirm the next-module recommendation respects prerequisite completion.

- [ ] Select each module from the navigation.
- [ ] Open prerequisites and confirm navigation to the referenced module.
- [ ] Mark a module complete, refresh, and confirm it remains complete.
- [ ] Unmark a module and confirm the progress percentage updates.
- [ ] Enter an assessment response and select rubric criteria.
- [ ] Refresh and confirm assessment draft and self-review persist.
- [ ] Confirm stale or malformed localStorage data does not prevent the app from loading.
- [ ] Confirm private browsing or blocked localStorage degrades gracefully.

## Course authoring

- [ ] Add unknown keys at course, module and lesson-section levels; confirm strict Schema validation rejects them instead of stripping them.
- [ ] Confirm the 2 MiB limit is measured in UTF-8 bytes, including multibyte Chinese text.
- [ ] Confirm validation errors show actionable JSON paths.

- [ ] Open the course editor and confirm the current course payload loads.
- [ ] Import a valid JSON course file and confirm Schema v1 validation succeeds.
- [ ] Import malformed JSON and confirm export is disabled with a visible error.
- [ ] Confirm the draft persists after refresh in the same browser.
- [ ] Export a valid course and re-import it without losing modules, labs or assessments.
- [ ] Confirm the editor discloses that drafts are browser-local and are not published.

## Labs

- [ ] Tokenizer accepts bounded text input and shows the toy BPE merge steps.
- [ ] Transformer toggles causal masking and updates score/weight/output matrices.
- [ ] RAG query changes update ranked teaching examples.
- [ ] Tool Calling rejects malformed, unauthorized and unknown tool requests.
- [ ] Agent Runtime blocks execution until approval and terminates on rejection.
- [ ] MCP lab discovers local capabilities without opening a network connection.
- [ ] Multi-Agent lab shows role findings and bounded synthesis.
- [ ] Evaluation lab reports exact-match metrics and failure cases.
- [ ] Each lab visibly states whether it is browser-local or simulation.
- [ ] No lab implies a real model call, production embedding, external network access or server sandbox.

## Accessibility and responsive layout

- [ ] Skip link moves focus to the main content.
- [ ] All controls are reachable and operable by keyboard.
- [ ] Focus indicators remain visible.
- [ ] Navigation and progress indicators expose meaningful accessible names and states.
- [ ] Matrix values and dynamic RAG results expose appropriate semantics.
- [ ] Layout remains usable at 320px width and common tablet/desktop widths.
- [ ] Reduced-motion preference is respected.
- [ ] Resolve all axe WCAG 2.0/2.1/2.2 A/AA violations.
- [ ] Verify contrast and screen-reader output with manual accessibility checks.

## Security and privacy

- [ ] Markdown raw HTML remains disabled.
- [ ] No provider API key or secret is bundled into the frontend.
- [ ] No server-sandbox or provider-backed capability is advertised as implemented.
- [ ] Assessment responses and module progress are clearly disclosed as browser-local.
- [ ] No learner response is transmitted to a server.

## Current verification status

The repository source and test files are committed. Runtime commands and browser E2E checks have not yet been executed in a controlled Node/browser environment. Do not mark the build, unit tests, or browser checks as passed until their output is recorded.


## Backend foundation acceptance

Run from a clean Python 3.11+ environment:

```bash
cd backend
python -m pip install -e ".[dev]"
pytest -q
ruff check app migrations tests
```

With a disposable PostgreSQL database and a schema-owner/migrator connection:

```bash
export ACADEMY_DATABASE_REQUIRED=true
export ACADEMY_DATABASE_URL='postgresql+asyncpg://...'
alembic -c alembic.ini upgrade head
alembic -c alembic.ini current
alembic -c alembic.ini history
```

Acceptance checklist:

- [ ] Alembic has one linear head at `0004_tenant_rls`.
- [ ] Fresh database migrates from base to head without errors.
- [ ] Downgrade/upgrade of the identity and RLS revisions succeeds on a disposable database.
- [ ] ORM metadata and migration schema agree; no unexplained autogenerate diff remains.
- [ ] Course-release digest, unique course/version, status and publication-timestamp constraints reject invalid rows.
- [ ] Identity uniqueness is `issuer + subject`; email is not used as an account identity key.
- [ ] Tenant membership roles carry tenant scope and use a composite foreign key to their membership.
- [ ] RLS is enabled and forced on identity/tenant tables and learner progress/assessment tables.
- [ ] The optional RLS integration test passes using a non-owner, non-superuser, non-`BYPASSRLS` runtime role.
- [ ] Missing user/tenant transaction context returns no tenant rows.
- [ ] Mismatched user/tenant context returns no cross-tenant rows for tenants, memberships, learning progress and assessment results.
- [ ] A learner cannot read or update another learner's progress or assessment attempt within the same tenant.
- [ ] Instructor access remains denied until a separately tested instructor-role policy is implemented.
- [ ] The runtime database role is distinct from the schema owner and has only required grants.
- [ ] No learner-data or tenant-management HTTP routes are exposed before OIDC, CSRF, authorization, RLS and privacy gates are accepted.

## Current backend verification status

Backend models, domain services, migrations and tests have been authored and pushed. Python dependency installation, pytest, Ruff, Alembic migration execution and PostgreSQL RLS integration acceptance have **not** been run in a controlled environment. These are pending evidence, not passed checks.
