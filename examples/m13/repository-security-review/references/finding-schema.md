# Finding Report Schema

Each finding is a JSON object with these required fields:

| Field | Type | Requirement |
|---|---|---|
| id | string | Stable finding identifier |
| severity | string | critical, high, medium, low, informational |
| path | string | Relative path inside the repository |
| line_start | integer | One-based line number |
| line_end | integer | Greater than or equal to line_start |
| evidence | string | Minimal source excerpt or factual trace |
| remediation | string | Actionable correction |

The report envelope contains commit_sha, reviewed_scope, excluded_scope, checks_performed, unverified_areas, and findings.

Do not invent line numbers, command output or runtime evidence. The schema validator checks shape only; it does not verify that evidence proves the claim.
