# 07 — Codex Execution Contract

## Purpose

This contract defines how Codex should execute implementation work for this repository.

## Before coding

Codex must:

1. Read the assigned GitHub issue completely.
2. Read `AGENTS.md`.
3. Read the canonical docs referenced by the issue.
4. Inspect the current code before proposing changes.
5. Restate scope, acceptance criteria, dependencies, and likely files to change.
6. Flag requirement conflicts before implementation.

## Branching

Use one branch per issue, for example:

- `feat/7-home-about`
- `feat/9-projects`
- `feat/10-resume-viewer`
- `fix/<issue>-<slug>`

Never implement directly on `main` unless the repository owner explicitly requests it.

## Implementation behavior

Codex should:

- make the smallest coherent change satisfying the issue
- reuse established components/tokens
- keep data out of presentation components
- avoid premature abstractions unrelated to the issue
- avoid hidden behavior changes
- preserve locale/theme/accessibility contracts
- avoid adding dependencies when the platform or existing code already solves the problem cleanly

## Testing

At minimum run the repository's applicable:

- lint
- typecheck
- focused tests
- production build

For interactive UI also manually/visually verify:

- keyboard access
- mobile viewport
- desktop viewport
- both themes
- both locales when strings/layout are affected

## PR handoff format

Every PR should contain:

### Summary

What changed and why.

### Acceptance criteria

Checklist mapped to the issue.

### Verification

Commands and manual checks performed.

### Screenshots

For visual changes, include relevant desktop/mobile/theme captures.

### Risks / follow-ups

Only real unresolved items; do not silently defer required acceptance criteria.

## Review handling

When review requests changes:

1. Address each thread explicitly.
2. Do not resolve a thread merely because code changed; confirm the concern is actually fixed.
3. Re-run relevant checks.
4. Summarize the correction in the PR conversation.

## Docs discipline

If implementation changes accepted behavior or architecture, update canonical docs in the same PR or propose a dedicated amendment first.

Do not treat temporary scratch notes as source of truth.

## Prohibited repository content

Never commit:

- `.env` / `.env.local`
- PEM/private keys
- API tokens
- mail provider secrets
- Supabase service-role credentials
- production credentials
- private backup archives/database dumps
