# 00 — Product Brief

## Product

Personal portfolio for **Quach Vo Anh Khoa**, migrating from WordPress to Next.js at:

- Production domain: `https://khoawatt.vercel.app`
- Legacy resume: `https://quachvoanhkhoa.feaon.com/resume/`

## Problem

The WordPress implementation is no longer the preferred foundation. The new portfolio should be easier to maintain, faster to evolve, more consistent visually, and structured so content can later move to a CMS without rewriting presentation components.

## Primary goals

1. Present Khoa clearly as a software engineer/full-stack developer.
2. Make skills, projects, career history, education/certifications, and contact information easy to scan.
3. Provide strong desktop presentation while remaining fully usable on mobile.
4. Support English and Vietnamese.
5. Support light and dark themes.
6. Keep project and resume data structured and maintainable.
7. Make future CMS adoption low-risk.
8. Preserve SEO equity during WordPress cutover.

## Primary navigation

`Logo | Home | About | Skills | Projects | Resume | Contact | GitHub | Language | Theme`

Behavior:

- Sticky header.
- Smooth section navigation.
- Home and the logo return to the locale root (`/` or `/vi`), clear the hash,
  preserve the query string, and scroll to the top.
- About remains the first in-page anchor inside the unified hero.
- Active section state where practical.
- GitHub opens the configured GitHub profile/repository destination.
- Language and theme controls remain keyboard accessible.

## Main page order

1. Unified Home / About hero
2. Skills
3. Projects
4. Resume
5. Contact
6. Footer

The product is a long-scroll portfolio. A dedicated `/projects` route is not required for MVP.

## About copy baseline

The intro begins with:

> Hi There
>
> I am Khoa, ...

Current WordPress copy may be used as migration input, but final text should be stored as locale content rather than embedded into components.

## Skills requirements

Two top-level tabs:

- **Tech Stack** — icon/name grid inspired by the provided stack reference.
- **Others** — flexible categories for non-core technical or future-role skills.

## Projects requirements

Interaction is inspired by Feaon's “Dự án tiêu biểu” component, but the new portfolio must have its own visual language.

Each project supports:

- title
- summary
- category/type
- technologies
- image/media
- optional highlights
- **Live Demo** action
- **Code** action

Only featured projects need to be shown on the main page. When the portfolio grows, provide a route or GitHub handoff rather than overloading the homepage.

## Resume requirements

Desktop layout is intentionally **not a grid**.

Left-side tab navigation initially includes:

- Career Journey
- Education & Certifications

Right-side content uses a structured slide/table/card viewer. Content shape should remain predictable across entries.

Resume media requirements:

- consistent thumbnail dimensions/aspect ratio
- explicit “View image” action
- full-size modal/lightbox
- close button (`X`)
- click-outside/Escape close behavior when accessible
- focus trapping/restoration for keyboard users

## Contact requirements

Two-column desktop structure:

- Left: contact details + social links
- Right: form

Form fields:

- Name
- Email
- Subject
- Message

Form needs validation, sending/success/error states, basic abuse protection, and server-side delivery.

## Footer requirements

Inspired by the supplied reference:

- brand/name + short intro
- social links
- navigation
- contact details
- newsletter email field + subscribe action
- bottom copyright row
- Privacy / Terms / Cookies links
- back-to-top control

Newsletter can be visually present in MVP even if subscription persistence is deferred; if deferred, the action must not pretend success.

Privacy / Terms / Cookies links are deferred until their routes exist. Until then the footer must not render fake `#` destinations; the links are added when the routes land.

## Image usage

Three personal portraits are supplied:

- `portrait-slider-01.jpg`
- `portrait-slider-02.jpg`
- `portrait-hero-banner.jpg`

Intent:

- third/side-profile portrait → hero/banner visual
- first two portraits → circular avatar bubbles integrated with the hero visual

## Design principle

Reference screenshots define **structure and interaction**, not a copy target. Skills, Projects, Resume, Contact, Hero/About, and Footer references come from different design languages, so they must be normalized into one coherent portfolio design system.

## MVP non-goals

- WordPress reuse as application runtime
- full blog rebuild
- CMS/admin before public UX stabilization
- complex user accounts
- comments/community features
- auto-importing all GitHub repositories

## Future scope

After MVP stabilizes:

- Supabase-backed portfolio CMS/admin
- project detail pages if needed
- blog/content migration if still valuable
- newsletter persistence/provider integration
- analytics dashboard
