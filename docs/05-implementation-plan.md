# 05 — Implementation Plan

## Phase 0 — Bootstrap & migration safety

### Deliverables

- initialize Next.js + TypeScript repository
- lint/typecheck/build scripts
- base folder architecture
- `.env.example`
- copy approved reference assets into non-production design-reference area or retain outside runtime bundle
- inventory existing WordPress routes/content/media
- capture redirect candidates
- export/backup WordPress before cutover

### Exit criteria

- clean build on `main`
- no secrets committed
- legacy content inventory exists
- requirements docs committed

---

## Phase 1 — Design system, shell, i18n, theme, navigation

### Deliverables

- typography and design tokens
- light/dark themes
- root layout/container system
- English/Vietnamese locale infrastructure
- sticky header
- desktop/mobile navigation
- GitHub action
- language switcher
- theme toggle
- active-section behavior
- responsive/footer shell placeholder

### Exit criteria

- both locales render
- theme persists without obvious flash
- keyboard navigation works
- mobile menu is usable

---

## Phase 2 — Home/About + Skills

### Home/About

- hero using `portrait-hero-banner.jpg`
- About structure with `Hi There`
- intro beginning `I am Khoa, ...`
- two-image portrait slider using the other two supplied images
- responsive crop/focal point tuning

### Skills

- Tech Stack / Others tabs
- responsive tech grid
- typed skill data
- icon mapping

### Exit criteria

- content is locale-aware
- slider/tabs keyboard accessible
- no major layout shift from images

---

## Phase 3 — Projects + Resume

### Projects

- typed featured project data
- left selector / right detail interaction on desktop
- mobile adaptation
- media panel
- Live Demo button
- Code button
- graceful missing-link behavior

### Resume

- category tabs/sidebar
- Career Journey
- Education & Certifications
- structured entry viewer
- consistent media thumbnails
- View Image action
- reusable lightbox

### Exit criteria

- all project actions use real destinations or are omitted
- resume modal passes keyboard smoke test
- responsive behavior is approved

---

## Phase 4 — Contact + Footer + quality

### Contact

- details/social links
- Name / Email / Subject / Message
- schema validation
- server-side delivery
- honeypot
- rate limiting
- UI states

### Footer

- brand/social
- navigation
- contact
- newsletter UI
- legal links (deferred until routes exist; do not emit fake `#` destinations)
- back-to-top

### Quality

- metadata
- sitemap/robots
- accessibility pass
- performance pass
- reduced-motion support
- 404/error states as needed

### Exit criteria

- contact delivery verified in production-like environment
- no fake newsletter success if backend is deferred
- Lighthouse/real-device issues triaged rather than blindly optimized to a score

---

## Phase 5 — Content migration & production cutover

### Deliverables

- final profile copy
- real skills list
- featured projects + links
- resume entries/media
- real contact/social destinations
- CV/resume file if downloadable
- production domain configuration
- redirect map
- sitemap submitted/verified as appropriate
- WordPress rollback/backup retained for agreed period

### Exit criteria

- domain serves Next.js site
- critical old URLs resolve or redirect intentionally
- assets load correctly
- contact works
- no accidental WordPress secret/data exposure

---

## Phase 6 — CMS (post-MVP)

Phase 6 starts only after the Phase 5 production cutover (#17) is complete and the live site has shown stable IA/data behavior. It is an owner-operated, single-user admin — no teams/roles beyond owner, no public signup, no workflow approvals, no generic page builder.

### Goals

- Runtime content management for profile, skills, projects, resume/CV, and links/contact — editable without commit + deploy.
- Runtime resume publicity control (`private | visible`) without redeploy.
- Content stays normalized behind the existing typed repository/view-model layer; the public UI never queries Supabase rows directly.

### Architecture

- Supabase is the runtime persistence layer for CMS-managed content and settings. A repository/service adapter converts database records into the same normalized typed view models the public components consume (locale validation, component contracts, accessibility, testability preserved).
- Runtime settings (e.g. `resume.publicity`) are stored server-side and read from one authoritative source by the public page and the gated `/api/resume-media/*` route.
- Resume privacy uses two independent gates: per-entity draft/published state, plus a global section `private | visible` publicity setting. Public rendering requires published AND visible; any read/config failure fails closed to private. Admin preview renders drafts only inside authenticated routes.
- Media stays in private/managed storage and is served only through gated/server-authorized routes.

### Slice sequencing

1. #18 — Supabase schema, security, permissions (common design authority).
2. #19 — single-owner authenticated admin foundation + runtime resume publicity setting.
3. CRUD slice 1 (#20) — Profile + Contact/Social + Skills (establishes the DB/repository/editing pattern).
4. CRUD slice 2 (#51) — Projects (featured/order, Live Demo/Code URL validation).
5. CRUD slice 3 (#52) — Resume/CV with draft/preview/privacy controls (most security-sensitive; last).
6. #21 — managed media/storage/publishing.

### Exit criteria

- Owner can update content and flip resume publicity in production without redeploying.
- Public site behavior is unchanged or improved (view models still validated; accessibility/theme/locale preserved).
- Resume stays fail-closed private by default; no private data reachable through public routes, storage URLs, or cache.

### Rule

Do not start Phase 6 code before the Phase 5 cutover (#17) is complete and the live site has shown stable IA/data behavior.
