# Repository Security Review Checklist

Review only the authorized repository scope.

## Input and trust boundaries
- Are external values validated at the boundary?
- Are prompt, document, issue, repository and tool outputs treated as untrusted?
- Can an attacker influence file paths, commands, URLs or model instructions?

## Identity and authorization
- Is identity bound to a stable issuer/subject rather than mutable display data?
- Are permissions checked server-side for every operation?
- Are tenant, resource and action scopes explicit?

## Secrets and data handling
- Are credentials absent from source, logs, prompts and generated artifacts?
- Are tokens scoped, short-lived and audience-bound?
- Are sensitive outputs minimized and redacted?

## Execution and filesystem
- Are paths canonicalized and constrained to an approved root?
- Are symlinks, traversal, archive extraction and temporary files handled safely?
- Are subprocesses, network access and writes explicitly authorized?

## Reliability and evidence
- Are retries idempotent and bounded?
- Are failures observable without leaking sensitive values?
- Does each finding include reproducible evidence and a commit reference?

A checklist item is a review prompt, not proof of a vulnerability. Record evidence and confidence separately.
