# OpenAPI Contract

`openapi/openapi.json` is the checked-in OpenAPI 3.1 contract exported directly from the FastAPI application.

## Source of truth

- Backend route definitions, Pydantic request/response models, and FastAPI metadata are authoritative.
- `src/api/generated.ts` is generated from the exported schema with `openapi-typescript`.
- Do not edit either generated file by hand.

## Commands

- `pnpm api:generate`: export the FastAPI schema and regenerate TypeScript types.
- `pnpm api:check`: regenerate both artifacts in a temporary directory and fail if either checked-in artifact has drifted.
- `pnpm typecheck`: type-check the frontend and generated contract types.

Run `pnpm api:generate` whenever a backend route, parameter, request model, response model, status code, or API metadata changes. Review both generated artifacts in the same change as the backend API change.

## Security boundary

The generated types describe the HTTP contract only. They do not grant authorization, validate runtime responses, or replace server-side authentication, CSRF protection, tenant authorization, or PostgreSQL RLS. Do not trust client-provided tenant or permission claims.
