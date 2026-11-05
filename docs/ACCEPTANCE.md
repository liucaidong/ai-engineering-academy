# Engineering Acceptance Checklist

## Scope

This checklist covers the current frontend foundation. It distinguishes repository implementation from runtime acceptance. A checked source-code item does not imply that a browser or production build has been executed.

## Repository and build

Run from a clean clone with Node.js >= 20.19:

```bash
npm install
npm test
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

## Learning workflow

- [ ] Select each module from the navigation.
- [ ] Open prerequisites and confirm navigation to the referenced module.
- [ ] Mark a module complete, refresh, and confirm it remains complete.
- [ ] Unmark a module and confirm the progress percentage updates.
- [ ] Enter an assessment response and select rubric criteria.
- [ ] Refresh and confirm assessment draft and self-review persist.
- [ ] Confirm stale or malformed localStorage data does not prevent the app from loading.
- [ ] Confirm private browsing or blocked localStorage degrades gracefully.

## Labs

- [ ] Tokenizer accepts bounded text input and shows the toy BPE merge steps.
- [ ] Transformer toggles causal masking and updates score/weight/output matrices.
- [ ] RAG query changes update ranked teaching examples.\n- [ ] Tool Calling rejects malformed, unauthorized and unknown tool requests.\n- [ ] Agent Runtime blocks execution until approval and terminates on rejection.\n- [ ] MCP lab discovers local capabilities without opening a network connection.\n- [ ] Multi-Agent lab shows role findings and bounded synthesis.\n- [ ] Evaluation lab reports exact-match metrics and failure cases.
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
- [ ] Resolve all axe WCAG 2.0/2.1/2.2 A/AA violations.\n- [ ] Verify contrast and screen-reader output with manual accessibility checks.

## Security and privacy

- [ ] Markdown raw HTML remains disabled.
- [ ] No provider API key or secret is bundled into the frontend.
- [ ] No server-sandbox or provider-backed capability is advertised as implemented.
- [ ] Assessment responses and module progress are clearly disclosed as browser-local.
- [ ] No learner response is transmitted to a server.

## Current verification status

The repository source and test files are committed. Runtime commands and browser E2E checks have not yet been executed in a controlled Node/browser environment. Do not mark the build, unit tests, or browser checks as passed until their output is recorded.
