# ADR 0002: Backend foundation as a modular monolith

- Status: Accepted
- Date: 2026-11-05
- Scope: P3 backend foundation

## Context

The product currently ships as a browser-first learning platform. Learning progress, bookmarks and assessment drafts remain in localStorage. There is no authenticated learner identity, server-side persistence, instructor workflow or trusted execution service. The architecture baseline explicitly calls for introducing backend capabilities only when their trust boundaries and product requirements are defined.

## Decision

1. Introduce a Python + FastAPI modular monolith as the first application API.
2. Use PostgreSQL as the transactional system of record when persistence is introduced.
3. Keep API configuration, database lifecycle, health endpoints and domain routers in separate modules.
4. Provide liveness and readiness endpoints. Readiness must verify required dependencies rather than merely report that the process is running.
5. Do not expose learner progress, assessment history or authoring mutation endpoints until authentication, authorization, ownership checks, data retention and audit requirements are designed.
6. Do not introduce Redis, a message broker or pgvector in the foundation slice. Add them only when asynchronous workload, backpressure or retrieval requirements justify them.
7. Do not execute learner code in the API process. Server-side execution requires a separate isolated worker/container design with explicit resource quotas and network policy.
8. Keep provider credentials server-side; no provider-backed model endpoint is part of this slice.

## Consequences

- The initial backend is intentionally small and deployable as one service.
- Database integration is a readiness dependency only when a database URL is configured as required for the selected environment.
- Local development may run without PostgreSQL only in an explicitly documented development mode; production configuration must fail closed when database configuration is absent.
- No frontend API migration is implied by creating the backend foundation.
- CI workflows remain absent/disabled during this phase, per delivery governance.

## Deferred decisions

- Identity provider and session/token strategy.
- Tenant and organization model.
- Learner progress event schema and transactional boundaries.
- Assessment-result provenance and instructor review workflow.
- Object storage, background jobs, vector search and model gateway.
- Production deployment topology, secrets manager and operational SLOs.
