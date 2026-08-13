# 02 — UI / UX Specification

## Design direction

Use a modern developer portfolio aesthetic with restrained animation and a unified visual system across every section.

Reference screenshots are for interaction/layout inspiration only.

## Global design system

Define tokens before section styling:

- page/background surfaces
- text hierarchy
- primary/accent color
- muted/border colors
- success/error states
- spacing scale
- container widths
- border radii
- shadows
- motion durations/easing
- typography scale

Both themes must be designed deliberately; dark mode is not an inverted afterthought.

## Header

### Desktop

- sticky/floating header within max-width container
- logo left
- links: Home, About, Skills, Projects, Resume, Contact
- GitHub icon button
- language switcher
- theme toggle

### Interaction

- visible current-section treatment
- anchor scrolling accounts for sticky header offset
- Home and logo target the locale root and clear any current hash
- top-of-page state is Home; About becomes active at its in-hero region
- icon buttons have accessible labels/tooltips
- locale/theme menus work by keyboard

## Home / Hero

Use `portrait-hero-banner.jpg` as the primary hero/banner visual.

Recommended treatment:

- visually dominant but not full-viewport image takeover
- controlled overlay/gradient if text is placed over the image
- preserve subject focal point across responsive crops
- use `object-position` intentionally per breakpoint

The hero also carries a compact About intro. Home is the locale-root,
top-of-page state; `#about` is the first in-page anchor target.

## About

About is integrated into the top hero rather than rendered as an oversized
standalone section. Its compact intro begins **I am Khoa, ...**.

The two supplied About portraits appear as circular avatar bubbles overlapping
the hero image frame. They retain meaningful alt text, explicit dimensions,
stable crops, and sufficient separation from the main portrait to keep the
composition intentional.

The hero action group links to existing Projects, Contact, and Resume anchor
targets. It uses clear hierarchy without copying the supplied reference style.

### Responsive

- desktop: content and framed hero visual sit side-by-side
- mobile: content and actions remain first, followed by the framed visual
- portrait bubbles scale and reposition without causing horizontal overflow

## Skills

Top tabs:

- Tech Stack
- Others

### Tech Stack

- structured icon/name cells inspired by screenshot
- consistent cell height
- responsive column count
- avoid truncating important technology names unless a tooltip/full label exists

### Others

Use grouped chips/cards/list rows so future roles can be represented without redesign.

## Projects

Desktop interaction pattern:

- left: compact vertical project list/selector
- right: selected project detail panel
- selected state is clear without relying on color only
- smooth content transition, but content remains readable with reduced motion

Detail panel includes:

- category/eyebrow
- title
- summary
- technologies
- main image
- **Live Demo** button
- **Code** button

If a project has multiple images, use a contained media carousel inside the detail panel; do not turn the whole section into an uncontrolled page carousel.

### Mobile

Do not preserve the desktop split at all costs. Preferred options:

- horizontal project selector + detail panel, or
- stacked accordion/cards with one expanded project

Choose based on implementation testing, preserving easy access to Live Demo/Code.

## Resume

Explicitly **non-grid**.

### Desktop

Left sidebar:

- Career Journey
- Education & Certifications
- future categories supported by data

Right viewer:

- one active entry or controlled slide/table sequence
- consistent schema and spacing
- navigation controls when category has multiple entries

Recommended entry anatomy:

- date/range
- title/credential
- organization
- location or mode if relevant
- summary
- highlights/responsibilities
- tags/subjects/skills
- optional media thumbnail
- View Image action

### Media

Thumbnails:

- fixed aspect ratio per media type
- bounded height
- `object-fit: cover` or `contain` based on content intent

Lightbox:

- overlay dialog
- original/full-size asset
- prominent close (`X`)
- Escape closes
- background click may close
- keyboard focus trapped while open
- focus restored to triggering button on close
- body scroll locked while open

### Mobile

- sidebar becomes horizontal tabs/select menu
- entry viewer becomes stacked single-column card/slide

## Contact

Desktop two-column panel inspired by reference.

Left:

- email
- phone if intentionally public
- location at city/country granularity if desired
- GitHub/LinkedIn/other social links

Right form:

- Name
- Email
- Subject
- Message
- Send Message

States:

- idle
- validating
- submitting
- success
- field error
- server error
- rate limited

## Footer

Desktop multi-column structure:

1. brand + short description + socials
2. navigation
3. contact
4. newsletter

Bottom row:

- copyright
- Privacy
- Terms
- Cookies
- back-to-top button

Mobile stacks logically; newsletter remains usable without excessive width.

## Motion

Allowed:

- subtle section reveal
- selected-project transitions
- image slider transitions
- hover/focus micro-interactions

Avoid:

- continuous decorative motion that distracts from content
- scroll-jacking
- large parallax effects that hurt mobile performance

Respect `prefers-reduced-motion`.

## Accessibility acceptance criteria

- semantic landmark structure
- logical heading order
- all actions keyboard operable
- visible focus indicator
- meaningful `alt` text or decorative empty alt
- dialogs announce correctly
- color contrast acceptable in both themes
- forms have labels and inline errors
- tabs use appropriate roles/state semantics
