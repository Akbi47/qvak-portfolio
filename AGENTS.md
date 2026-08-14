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

1. One issue = one bounded scope; create a feature branch from `main`. Do not mix unrelated refactors into feature work.
2. Prefer typed data and reusable components over section-specific hard-coding.
3. All public UI must support light/dark themes and `en`/`vi` locales.
4. Preserve accessibility: keyboard navigation, visible focus, semantic headings, dialog focus management, alt text, reduced-motion behavior.
5. Images must use deliberate dimensions/aspect ratios and avoid layout shift.
6. Never commit secrets, `.env*`, private keys, tokens, or production credentials.
7. Do not introduce the CMS into MVP tasks unless the issue explicitly belongs to the CMS phase.
8. Every implementation PR must state tests run, screenshots/visual verification, known limitations, and docs affected.
9. Follow the PR contract in `docs/07-codex-execution-contract.md` and the issue template in `.github/ISSUE_TEMPLATE/feature.md`.

## Commands

- `npm run lint` — ESLint (`eslint .`)
- `npm run typecheck` — runs `next typegen && tsc --noEmit` (needed because Next types are generated)
- `npm run build` — production build (Next 16 defaults to Turbopack)
- `npm run dev` — dev server
- `gh` is available for issue/PR workflows; PRs use `Closes #<issue>` with one PR per issue.

There is **no automated test runner** configured — no test files, no Jest/Playwright config committed. Verification is manual/visual smoke checks plus lint/typecheck/build. Do not invent a `npm test`.

### Build quirk

`npm run build` uses Turbopack, which can fail in sandboxed environments (CSS worker cannot bind an internal port → `Operation not permitted`). If the default build fails this way, run `npm run build -- --webpack` — that path is verified passing.

## Architecture notes

- Next.js 16 App Router, React 19, Tailwind CSS 4. Path alias `@/*` → `src/*`.
- **Locale routing is in `src/proxy.ts`** (Next 16 renamed `middleware.ts` to `proxy.ts` — do not create a `middleware.ts`). Locales are `["en", "vi"]` with `en` as the default at the locale root (`/` and `/vi`). Config lives in `src/features/i18n/config.ts`; use `getLocalizedPathname` for locale-aware links and `getLocaleFromParams` in server components.
- Server components receive `params` as a **`Promise`** (Next 16 async params), e.g. `params: Promise<{ locale: string }>`. `getMessages` and i18n message loaders are `server-only` — pass messages into client components as props.
- **Content layer**: `src/content/*.ts` export typed accessors like `getPortfolioProfile(locale)` / `getSkillsContent(locale)` returning view models; translatable strings use `Record<Locale, string>`. Keep data out of components.
- **Client boundary**: only interactive components carry `"use client"` (e.g. `site-header`, `locale-switcher`, `theme-provider`, `skills-section`). Keep section shells server-rendered.
- **Theme**: set via `data-theme` on `<html>` with `ThemeScript` in `<head>` to prevent flash; storage key `qvak.theme` in `src/features/theme/config.ts`.
- **Placeholders**: `src/app/[locale]/page.tsx` renders generic placeholder anchor sections (from `navigationSectionIds`) for Projects/Resume/Contact/Footer. New section issues replace these placeholders; don't build new sections ad hoc elsewhere.
- Empty directories are preserved with `.gitkeep` files — keep them when adding files.
- `docs/references/` and `docs/migration/legacy-assets/` hold design-reference/migration evidence only; keep them out of the runtime bundle and do not move them into `public/`. Ignore `:Zone.Identifier` junk files.

## Quality gates

Expected before merge:

- lint
- typecheck
- production build (`-- --webpack` if Turbopack fails in this environment)
- accessibility/keyboard smoke check for interactive UI
- responsive smoke check at mobile/tablet/desktop breakpoints
- visual verification screenshots in the PR for UI changes
