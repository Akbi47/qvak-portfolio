# 01 — Information Architecture

## Route strategy

### MVP routes

- `/` — default-locale portfolio
- `/vi` — Vietnamese portfolio
- optional locale-aware equivalents based on final i18n routing implementation

### Legacy routes

During cutover, inventory all indexed WordPress routes before changing behavior. `/resume/` must either:

1. remain available as a dedicated resume route, or
2. redirect to the Resume section on the new portfolio.

Do not delete old indexed routes without an explicit redirect decision.

### Future routes

- `/projects` — optional project archive
- `/projects/[slug]` — optional project detail
- `/blog` — only if blog migration becomes a separate approved scope
- `/admin` — optional CMS phase

## Homepage anchors

Recommended anchors:

- `#home`
- `#about`
- `#skills`
- `#projects`
- `#resume`
- `#contact`

`Home` goes to the top visual hero. `About` goes to the intro block immediately following/overlapping the hero experience, preserving separate navigation semantics.

## Navigation model

Desktop:

- logo left
- primary links centered/right
- GitHub icon
- locale switcher
- theme toggle

Mobile:

- compact logo
- menu trigger
- locale/theme controls remain discoverable
- menu closes after section navigation
- no hover-only interaction

## Content hierarchy

### Home

Purpose: immediate identity and visual recognition.

- name/role or concise identity line
- hero/banner portrait
- optional primary CTA to Projects/Resume

### About

Purpose: concise introduction.

- `Hi There`
- description beginning `I am Khoa, ...`
- two-image portrait slider
- optional CTA(s): Projects, Resume, Contact

### Skills

- Tech Stack
- Others

### Projects

- featured project selector/list
- selected project detail panel
- Live Demo
- Code
- fallback/disabled treatment when a link is intentionally unavailable

### Resume

- category navigation
- selected category viewer
- structured entries
- optional media
- View Image lightbox

### Contact

- details/socials
- form

### Footer

- identity
- navigation
- contact
- newsletter
- legal links
- back to top

## Content ownership

Presentation components consume normalized typed content. Components must not own domain data.

Suggested content namespaces:

- profile
- navigation
- skills
- projects
- resume
- contact
- socialLinks
- footer
- legal
