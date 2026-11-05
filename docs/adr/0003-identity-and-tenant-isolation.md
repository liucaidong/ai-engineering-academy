# ADR 0003: Identity, tenant membership and learner-data isolation

- Status: Accepted as the implementation baseline; provider selection remains open
- Date: 2026-11-05
- Scope: Account, organization and learner-data APIs

## Context

The platform currently stores learning progress and assessment drafts in the browser. The backend has operational endpoints and a catalog-only course-release schema, but no account, tenant, learner-data or authorization tables. Learner-data APIs must not be exposed until identity and isolation rules are explicit.

The product serves individual learners and may later support schools, training providers and instructor-led cohorts. A single user may participate in more than one organization and may hold more than one role within an organization.

## Decisions

### 1. Identity federation

- Use OpenID Connect (OIDC) Authorization Code flow with PKCE as the supported sign-in protocol.
- Do not build or store local passwords in this application foundation.
- Identify an external identity by the pair `issuer + subject`; email is a contact attribute, not an identity key.
- Never automatically merge accounts solely because email addresses match. Account linking requires an authenticated existing account and proof of control of the new identity.
- Keep provider selection and production client registration outside this ADR. No real sign-in endpoint is enabled until issuer, redirect URI, key rotation and account recovery operations are configured.

### 2. Application session

- After successful OIDC callback validation, issue a cryptographically random opaque session token; store only its cryptographic hash server-side.
- Deliver the token only in a `Secure; HttpOnly; SameSite=Lax` cookie. Never store bearer session tokens in localStorage or expose them to browser JavaScript.
- Enforce idle and absolute expiry, server-side revocation, rotation after re-authentication and revocation on logout or account suspension.
- Validate OIDC state, nonce, PKCE and issuer/audience/signature/expiry claims.
- Cookie-authenticated state-changing requests require CSRF protection and strict Origin validation. Credentialed CORS must use an explicit allowlist, never wildcard origins.
- Session and authentication events must not log raw tokens, authorization codes or provider assertions.

### 3. Tenant and membership model

- Model both personal workspaces and organizations as tenants.
- Every user receives a personal tenant when account provisioning is implemented.
- A user can belong to multiple tenants through explicit memberships.
- Store roles as membership grants, not as a single global role on the user. Initial tenant roles are `learner`, `instructor` and `tenant_admin`; a membership may hold multiple roles.
- Platform operations privileges are separate from tenant roles and must not be granted by user-controlled claims.
- Invitations use one-time random tokens stored only as hashes, expire, and are accepted only by the intended verified identity.

### 4. Tenant-owned data and authorization

- Every tenant-owned business row must carry a non-null `tenant_id`. Learner-owned rows must additionally carry `user_id`.
- Every request resolves an authenticated user and an active tenant membership before reaching a domain service.
- Domain services enforce both tenant membership and resource ownership; possession of a UUID is never authorization.
- Foreign keys between tenant-owned records must include tenant scope where necessary, preventing cross-tenant references at the database boundary.
- PostgreSQL Row-Level Security (RLS) is required as defense in depth for learner/tenant tables before production learner-data writes are enabled.
- The application sets user and tenant context with transaction-local database settings inside every transaction. The runtime database role must not own protected tables and must not have `BYPASSRLS`; RLS must be forced where appropriate.
- No tenant context may be kept in pooled connection session state outside the current transaction. Missing context must deny access, not fall back to an unscoped query.

### 5. Learner data

- Progress and assessment records are scoped by tenant, user and course-release version.
- Assessment results distinguish learner self-review, automated evaluation and instructor review; self-review must never be represented as instructor grading.
- Store only data required for learning workflows. Do not collect date of birth, government identifiers, sensitive personal attributes or detailed behavioral profiles as part of the initial account model.
- Define export, deletion, retention, instructor visibility and audit policy before enabling learner-data writes.
- Before onboarding minors through an organization or direct registration, complete a jurisdiction-specific privacy/legal review and determine the required guardian/organization consent workflow.

### 6. Audit and operations

- Record security-relevant events: sign-in success/failure, account linking, session revocation, membership/invitation changes, role grants and privileged access.
- Audit records include actor, tenant (when applicable), action, resource reference, request ID and timestamp. Avoid raw lesson answers, access tokens and unnecessary personal data.
- Security logs and learner content have separate access controls and retention policies.

## Implementation gates

The following must be completed before learner-data APIs are enabled:

1. Select and configure an OIDC provider and production callback/origin allowlists.
2. Implement OIDC callback validation, opaque session issuance, CSRF protection, logout and revocation.
3. Implement users, external identities, sessions, tenants, memberships, role grants and invitations with migrations.
4. Add authorization tests for cross-user and cross-tenant denial, including guessed resource IDs.
5. Add PostgreSQL RLS policies and integration tests using the actual non-owner runtime database role.
6. Define learner-data retention, export/deletion and audit controls.
7. Complete privacy review for the intended learner age groups and deployment jurisdictions.

## Consequences

- The current backend remains catalog-only; this ADR does not add sign-in or learner-data endpoints.
- The initial database schema will be extended only after each gate has a migration and tests.
- The design supports individual learning and organization-managed learning without putting tenant roles on global user records.
- Production learner-data writes remain disabled until database RLS and application authorization are both verified.

## Deferred decisions

- OIDC provider and hosting arrangement.
- Whether the frontend and API share a site or require cross-site cookie configuration.
- Session idle/absolute lifetime values and re-authentication policy.
- Detailed progress, assessment, invitation and audit schemas.
- Data retention durations and minor-consent workflow by jurisdiction.
