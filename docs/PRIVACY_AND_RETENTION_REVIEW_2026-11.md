# Privacy and Data-Retention Engineering Review — 2026-11

**Status:** Engineering data-inventory and control-gap assessment completed. This is not legal advice, a privacy notice, a DPIA/PIA, a DPA, or approval to activate learner data in production. Jurisdiction, learner age bands, controller/processor roles, retention periods and user-rights procedures still require an accountable owner to approve.

## 1. Scope and deployment boundary

This review covers the current AI Engineering Academy implementation: browser-local learning state, FastAPI authentication/session services, tenant membership, PostgreSQL learner records, immutable course releases and security audit events. The local persistent PostgreSQL instance is development-only. `ACADEMY_LEARNER_DATA_API_ENABLED` remains false; frontend auth and learner-sync flags also remain false by default. No production identity provider is configured.

## 2. Data inventory

| Data class | Current fields / examples | Purpose | Current control |
|---|---|---|---|
| Account profile | Internal UUID, display name, email, email verification timestamp, active/suspended/deletion-pending status | Identify a learner account | Session-derived identity; RLS and tenant membership checks |
| External identity | OIDC issuer and subject, creation and last-authenticated timestamps | Stable provider identity mapping | Unique issuer+subject; no raw access/refresh token persistence |
| Authentication session | User UUID, SHA-256 token hash, created/expiry/last-seen/revoked timestamps | Maintain browser session | Opaque random token in HttpOnly cookie; database stores hash only; CSRF-bound unsafe requests; shared/exclusive lifecycle locks |
| OIDC login transaction | State/nonce hashes, encrypted PKCE verifier, redirect URI, expiry/consumption timestamps | One-time authorization-code flow | State-hash RLS bootstrap, Fernet encryption, consume-once row lock, short expiry |
| Tenant and membership | Tenant name/type/status, membership and role, invitation email and token hash | Personal/organization workspace authorization | Fail-closed forced RLS; no general CRUD routes; invitation tokens hashed |
| Learning progress | Tenant/user/release/module identifiers, completion state and timestamps | Resume learning | Owner- and tenant-scoped RLS; immutable release UUID; no-store API responses |
| Assessment records | Assessment key, attempt number/status, learner response, self-review, score/feedback and grader metadata | Persist drafts and assessment outcomes | Owner- and tenant-scoped RLS; bounded JSON payload; latest-attempt lifecycle lock; learner self-grading blocked by database constraint/trigger |
| Audit events | Actor/tenant, action, resource, request ID, metadata and occurrence timestamp | Security and publication accountability | Append-only use in application flows; tenant RLS plus narrow platform-publisher insert policy |
| Course release content | Versioned module/lesson/assessment snapshot and SHA-256 digest | Immutable curriculum delivery | Platform-only insert, database immutability guard, runtime read-only grants |
| Browser-local learning state | Bookmarks, completion flags, assessment drafts, guest/legacy data | Offline/guest continuity | Namespaced by authenticated user+tenant or guest scope; explicit guest import; no silent account migration |

## 3. Data minimization and security assessment

- Session credentials are opaque random values; only a one-way hash is stored in PostgreSQL. The session cookie is HttpOnly, Secure in secure deployments, SameSite=Lax and path-scoped. CSRF cookie is intentionally readable by the browser and bound to the session token.
- OIDC transaction state and nonce are hashed; PKCE verifier is encrypted at rest. Provider tokens are not retained as long-lived application credentials.
- User identity is resolved from the server-side session. Client-supplied user IDs, role claims, or tenant membership are not trusted as authorization inputs.
- Tenant and learner rows use forced RLS. The runtime role is a non-owner, non-superuser, non-BYPASSRLS role. Global course releases are read-only to runtime; the publisher role alone can insert published snapshots and publication audit events. No default grants are applied to future migration-created tables.
- Learner responses use `Cache-Control: no-store`; assessment payloads are size-bounded and reject non-finite JSON values.
- Guest state is not silently copied into an authenticated account. Explicit import preserves account-side conflicts and leaves guest source data intact.
- No analytics/advertising SDK or third-party learner telemetry export is part of the current learner-data path. This must be rechecked if such integrations are added.

## 4. Retention and user-rights gaps

The schema records expiry/revocation timestamps but the repository does not yet provide a complete, approved retention and deletion lifecycle. In particular:

1. Expired/consumed OIDC login transactions have an expiry field, but a scheduled cleanup/retention job is not yet established.
2. Expired/revoked sessions are not yet covered by an approved purge schedule.
3. Audit-event retention, archival, legal hold and access-review periods are not approved.
4. There is no end-user data export endpoint or verified account-erasure workflow covering external identities, sessions, memberships, progress, assessment attempts, browser-local state, backups and audit references.
5. `deletion_pending` exists as a user status, but it is not a complete deletion workflow or evidence of completed erasure.
6. Backup retention, point-in-time recovery, encryption-at-rest guarantees and deletion propagation into backups depend on the eventual hosting provider and are not configured by this repository.

### Proposed schedule for accountable-owner review — not yet active

| Data class | Proposed starting point | Required decision / implementation |
|---|---|---|
| OIDC login transactions | Purge consumed or expired rows within 24 hours | Add scheduled cleanup and verify no live transaction can be removed |
| Expired/revoked sessions | Retain 30 days after expiry/revocation, then purge | Approve security-investigation need; add bounded cleanup and session revocation tests |
| Invitations | Purge expired/accepted token material within 30 days | Confirm organizational audit requirements; preserve minimal acceptance audit event |
| Learner progress and assessment content | Retain while account/workspace is active; erase or irreversibly de-identify on approved deletion request | Decide school/organization record obligations, minors' rights and assessment appeal periods |
| Audit events | Proposed 12-month online retention, then approved archive/deletion policy | Approve legal/security obligations, append-only archive and restricted access |
| Browser-local data | Retain until user clears browser data or uses an explicit clear/import control | Provide clear-state controls and document browser/device limitations |
| Course release snapshots | Retain immutable versions while referenced by progress/assessment history and product policy | Define archival/deprecation and legal takedown process; never mutate published snapshots |

These periods are proposals for review, not code defaults, contractual promises or statements of legal compliance.

## 5. Production blockers

- Register a real OIDC client, verify issuer/audience/redirect and same-site deployment, store secrets through the production secret manager, and complete provider-backed login/logout/session-revocation E2E.
- Decide the jurisdictions, learner age bands and whether schools/organizations act as controller, processor or joint controller. If minors are in scope, define guardian/organization consent and age-appropriate notices before onboarding.
- Approve a privacy notice, lawful basis/consent model where applicable, data-subject request process, retention schedule, deletion and export workflow, backup deletion semantics and incident/breach response ownership.
- Review production database TLS, encryption at rest, key management, backup/restore, operational access, audit access and data residency with the selected hosting provider.
- Keep learner API and frontend sync flags disabled until the above approvals and external tests have evidence.

## 6. Acceptance decision

**Engineering control baseline:** substantially implemented and locally verified, including PostgreSQL 18.6 RLS acceptance with a non-owner/non-superuser/non-BYPASSRLS role, session-bound CSRF, immutable course releases, runtime/publisher separation and feature-gated learner routes.

**Production privacy approval:** not granted. This repository cannot determine the operator's legal role, applicable jurisdiction, approved retention period, consent workflow or hosting-provider guarantees. Do not infer approval from this engineering review.
