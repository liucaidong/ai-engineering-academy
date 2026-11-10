# ADR-0009: Course release consumption and publication trust boundary

- Status: Accepted implementation boundary
- Date: 2026-11-10
- Scope: Immutable course snapshots, learner-facing release discovery and progress/assessment version binding

## Context

The repository has a global `course_releases` catalog table and domain services that build draft snapshots, compute canonical SHA-256 digests and publish a draft exactly once after digest verification. However:

- No HTTP read endpoint exposes published release metadata or content snapshots.
- No authenticated authoring/publishing HTTP workflow or operator publication command exists.
- The frontend renders a statically bundled `courseCatalog` and lesson chunks; it does not know a persisted `course_release_id`.
- Learner progress and assessment APIs require a real `course_release_id` and validate module/assessment keys against the published snapshot. A frontend curriculum version string is not a database release ID.

Therefore the current frontend cannot safely write learner progress to the existing learner APIs. It would be incorrect to synthesize a release UUID, infer an ID from a version string, or silently attach legacy browser progress to an arbitrary release.

## Decisions

### 1. Release identity and immutability

- A persisted release UUID is the authoritative version identity for learner progress and assessment attempts.
- `course_key + version` remains unique; content is an immutable JSON snapshot addressed by its canonical SHA-256 digest.
- Drafts are never visible to learner-facing read APIs. Published releases are listed for new learning. Retired releases may remain readable for historical records, but cannot accept new progress or attempts.
- A release's content must be validated against the same strict course schema used by the frontend before publication.

### 2. Publication authority is platform-scoped

- Publishing the global course catalog is a platform operation, not a tenant operation.
- `tenant_admin` must not gain global course publication rights. Platform operations privileges remain separate from tenant membership roles, consistent with ADR-0003.
- The initial publication mechanism must be an explicit operator-controlled workflow with an auditable actor, request/operation reference, version, schema version, digest and timestamp.
- No public or learner-facing create/publish endpoint is introduced as part of read-path implementation.

### 3. Learner-facing release read path

- Release discovery and content retrieval require an authenticated active tenant membership and the existing `course:read` permission.
- Discovery returns published release metadata only. Content retrieval may read published or retired snapshots so existing learner records remain interpretable.
- Responses are non-cacheable at the browser/shared-cache layer (`Cache-Control: no-store`) until a separate public immutable-content caching policy is designed.
- The server remains the authorization source; `X-Tenant-ID` is context only and is checked against the authenticated membership and role on every request.

### 4. Learner progress synchronization and legacy data

- Progress and assessment records are pinned to a persisted release UUID, never just a course version label.
- Existing local completion records contain module IDs but no release ID, timestamp or account identity. They must remain intact until the user explicitly chooses an import/reconciliation action against a known published release.
- Reconciliation must be idempotent, preserve the original local snapshot, ignore module IDs absent from the target release, and never silently downgrade server-completed work.
- Conflicting local/server state must be reported and resolved by an explicit, documented policy; local storage is not an authority over server state.

## Consequences

- Release read APIs can be implemented and tested independently of the platform publishing control plane.
- Learner progress integration is gated on a real published release existing in the target database and being matched to the bundled curriculum content.
- No learner-data feature flag is enabled by this ADR. Provider-backed OIDC, runtime DB least privilege and privacy/retention gates remain mandatory.
- The platform publishing role, operator workflow and initial release bootstrap remain explicit follow-up work.

## Acceptance evidence required

1. Strict course-schema validation and digest verification before publication.
2. Duplicate `course_key + version`, mutated digest and concurrent publication rejection.
3. Learner release discovery exposes published releases only; drafts are invisible.
4. Release detail returns only published/retired snapshots to an authorized tenant member.
5. Cross-tenant membership and missing permission are denied; actual PostgreSQL RLS/runtime role is used for integration acceptance.
6. Learner progress and attempts reference a real release UUID and are rejected for retired releases on create.
7. Legacy local-state import is explicit, idempotent and covered by conflict/recovery tests.
