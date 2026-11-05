# Engineering Governance

## Execution safety
Every lab must declare one execution mode: simulation, browser-local, server-sandbox or provider-backed. A UI label is not proof of an isolation boundary. Server sandbox and provider-backed modes remain unavailable until their controls are implemented and tested.

## Least privilege
- Do not execute arbitrary learner code in the main application origin.
- Do not expose provider secrets to browser bundles.
- Require explicit authorization for tools with external side effects.
- Validate inputs and outputs at trust boundaries.
- Keep simulation datasets local and clearly labelled.

## Content integrity
- Validate module references and prerequisite DAGs at build/test time.
- Keep source metadata adjacent to the content it supports.
- Do not fabricate citations or imply scaffold copy is authoritative courseware.
- Render Markdown without raw HTML by default.

## Delivery governance
- Batch related source changes into a small number of commits.
- Do not add or enable GitHub Actions workflows during the current foundation phase.
- Report code written, repository state, and runtime verification separately.
