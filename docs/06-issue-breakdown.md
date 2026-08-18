# 06 — GitHub Issue Breakdown

Create issues in this order. Titles are intentionally implementation-oriented for Codex.

## Epic 0 — Bootstrap

### Issue 1 — `chore: bootstrap Next.js portfolio repository`

Scope:

- Next.js + TypeScript
- lint/typecheck/build scripts
- initial source structure
- env safety
- base README/AGENTS docs

Acceptance:

- clean install/build
- no secrets
- `main` remains deployable

### Issue 2 — `docs: inventory WordPress content and redirect requirements`

Scope:

- homepage
- resume
- blog/indexed URLs
- media needed for portfolio
- redirect candidates

Acceptance:

- migration inventory committed
- unresolved migration decisions explicitly listed

## Epic 1 — Foundation

### Issue 3 — `feat: add portfolio design system and responsive page shell`

### Issue 4 — `feat: add English/Vietnamese localization`

### Issue 5 — `feat: add light-dark theme support`

### Issue 6 — `feat: build sticky responsive header navigation`

Includes GitHub, locale switcher, theme toggle, anchor navigation.

## Epic 2 — Home & Skills

### Issue 7 — `feat: build home hero and about intro experience`

Includes hero banner portrait + 2-image About slider.

### Issue 8 — `feat: build tabbed skills section`

Includes Tech Stack + Others.

## Epic 3 — Portfolio content

### Issue 9 — `feat: build featured projects selector and detail viewer`

Includes Live Demo + Code.

### Issue 10 — `feat: build resume category viewer`

Includes Career Journey + Education & Certifications.

### Issue 11 — `feat: add accessible resume image lightbox`

Keep lightbox reusable and separately testable.

## Epic 4 — Conversion & site completion

### Issue 12 — `feat: implement contact form delivery and abuse protection`

### Issue 13 — `feat: build multi-column footer and newsletter shell`

### Issue 14 — `feat: add SEO metadata sitemap structured data and redirects`

### Issue 15 — `test: accessibility responsive and performance hardening`

## Epic 5 — Launch

### Issue 16 — `content: migrate production portfolio content`

Requires owner decisions captured in `docs/migration/owner-decision-capture.md` (created via issue #46). Do not guess unresolved inventory decisions.

### Issue 17 — `ops: cut over quachvoanhkhoa.feaon.com to Next.js`

Requires rollback notes and redirect verification.

## Post-MVP epic — CMS

### Issue 18 — `design: specify Supabase portfolio CMS schema and permissions`

Common design authority. Translation-aware tables, RLS, runtime settings (resume publicity), the two-gate resume privacy model (per-entity draft/published + global private/visible publicity), repository/view-model adapter contract, media strategy, migration/backfill.

### Issue 19 — `feat: implement authenticated portfolio admin foundation and runtime resume publicity`

Owner-only auth + server-side authorization, no public signup, no browser secrets. Admin Settings screen toggling `resume.publicity = private | visible` (confirmation + changed-at/owner audit), fail-closed to private; public page and `/api/resume-media/*` read one authoritative value.

### Issue 20 — `feat: add CMS CRUD for profile contact and skills`

First CRUD slice (lowest risk): Profile, Contact/Social, Skills — EN/VI translations, URL validation, deterministic ordering, server-side reads/writes mapped into existing typed view models. Establishes the DB/repository/editing pattern.

### Issue 51 — `feat: add CMS CRUD for projects`

Second CRUD slice: featured/order, Live Demo/Code URL validation.

### Issue 52 — `feat: add CMS CRUD for resume and CV`

Third CRUD slice (most security-sensitive; last): resume categories/entries with draft/preview and the global publicity gate; private media served only through the gated route.

### Issue 21 — `feat: add CMS media management and publishing workflow`

Postponed after the CRUD slices; expands the storage/security surface (permissions, private/public buckets, orphan cleanup, alt/caption translations, publishing behavior).

## Dependency graph

```text
1 -> 3 -> 6 -> 7
      |    |    -> 8
      |    -> 4/5
      -> 9/10/11

2 -----------------> 14 -> 17
12/13/14/15/16 ----> 17
17 ----------------> CMS phase (18+), when approved
```

## PR policy

- one primary issue per PR
- include `Closes #<issue>` only when all acceptance criteria are met
- no opportunistic CMS work inside MVP PRs
- visual PRs include before/after or viewport screenshots
- interactive PRs describe keyboard behavior
