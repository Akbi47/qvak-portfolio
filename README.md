# Quach Vo Anh Khoa — Portfolio Next.js

Planning and implementation source of truth for migrating the legacy `quachvoanhkhoa.feaon.com` WordPress portfolio to Next.js at the production domain `khoawatt.com`.

## Goal

Build a modern, multilingual, responsive portfolio with a consistent design system, typed content models, and a clean path to a lightweight CMS later.

## Start here

- **First implementation task:** [Issue #1 — bootstrap Next.js portfolio repository](../../issues/1)
- Full execution order: [`docs/06-issue-breakdown.md`](docs/06-issue-breakdown.md)
- Codex rules: [`AGENTS.md`](AGENTS.md) and [`docs/07-codex-execution-contract.md`](docs/07-codex-execution-contract.md)

Do not start implementation from an arbitrary feature issue. Bootstrap and migration inventory establish the foundation first.

## Canonical documents

1. [`docs/00-product-brief.md`](docs/00-product-brief.md)
2. [`docs/01-information-architecture.md`](docs/01-information-architecture.md)
3. [`docs/02-ui-ux-spec.md`](docs/02-ui-ux-spec.md)
4. [`docs/03-content-data-model.md`](docs/03-content-data-model.md)
5. [`docs/04-technical-architecture.md`](docs/04-technical-architecture.md)
6. [`docs/05-implementation-plan.md`](docs/05-implementation-plan.md)
7. [`docs/06-issue-breakdown.md`](docs/06-issue-breakdown.md)
8. [`docs/07-codex-execution-contract.md`](docs/07-codex-execution-contract.md)
9. [`docs/migration/wordpress-content-inventory.md`](docs/migration/wordpress-content-inventory.md)
10. [`docs/references/README.md`](docs/references/README.md)

## Requirement status

**Requirement Freeze v1 — 2026-08-12**

Further changes should be recorded as amendments instead of silently changing accepted behavior.

## Current delivery strategy

- Phase 0: repository/bootstrap + content inventory
- Phase 1: design system + shell + i18n/theme/navigation
- Phase 2: Home/About + Skills
- Phase 3: Projects + Resume
- Phase 4: Contact + Footer + SEO/accessibility/performance
- Phase 5: content migration, production cutover, redirects
- Phase 6: optional Supabase-backed CMS/admin

The GitHub tracker currently contains Issues **#1–#17 for MVP/launch** and **#18–#21 for the post-MVP CMS phase**.

## Non-goals for MVP

- Rebuilding WordPress itself
- Migrating the old blog into the first portfolio release
- Building a CMS before the public UI and content schema stabilize
- Rendering every GitHub repository as a project
