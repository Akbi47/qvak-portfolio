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

### Deliverables

- Supabase schema
- translation-aware content tables
- admin authentication
- CRUD for skills/projects/resume
- media management
- ordering/featured controls
- publishing workflow as needed
- preview/revalidation strategy

### Rule

Do not start this phase merely because a field is inconvenient to edit locally. Start it after the public information architecture and data schema have stabilized.
