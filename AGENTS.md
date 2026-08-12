# AGENTS.md — Portfolio Next.js

This repository uses docs-first execution.

## Source of truth

Before implementing a feature, read:

- `docs/00-product-brief.md`
- `docs/02-ui-ux-spec.md`
- `docs/03-content-data-model.md`
- `docs/04-technical-architecture.md`
- `docs/05-implementation-plan.md`
- the relevant issue

If an issue conflicts with an accepted canonical document, stop and report the conflict. Do not silently reinterpret requirements.

## Working rules

1. One issue = one bounded scope.
2. Create a feature branch from `main`.
3. Do not mix unrelated refactors into feature work.
4. Prefer typed data and reusable components over section-specific hard-coding.
5. All public UI must support light/dark themes and `en`/`vi` locales.
6. Preserve accessibility: keyboard navigation, visible focus, semantic headings, dialog focus management, alt text, reduced-motion behavior.
7. Images must use deliberate dimensions/aspect ratios and avoid layout shift.
8. Never commit secrets, `.env*`, private keys, tokens, or production credentials.
9. Do not introduce the CMS into MVP tasks unless the issue explicitly belongs to the CMS phase.
10. Every implementation PR must state tests run, screenshots/visual verification, known limitations, and docs affected.

## Quality gates

Expected before merge:

- lint
- typecheck
- tests relevant to changed behavior
- production build
- accessibility/keyboard smoke check for interactive UI
- responsive smoke check at mobile/tablet/desktop breakpoints
