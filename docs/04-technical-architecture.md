# 04 — Technical Architecture

## Architecture goals

- fast static/server-rendered portfolio pages
- minimal client JavaScript
- explicit client boundaries only for interactions
- content layer independent from UI
- easy migration from local content to CMS
- accessible and SEO-safe

## Proposed stack

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- reusable accessible component primitives (shadcn/ui-style approach is acceptable)
- locale library such as `next-intl`
- theme management via a small client provider (`next-themes`-style approach is acceptable)
- Zod for runtime form/content validation where useful
- server-side email provider for Contact
- image optimization through Next.js image handling

Do not lock exact package versions in planning docs. Resolve versions during repository bootstrap and commit the lockfile.

## Suggested source structure

```text
src/
  app/
    [locale-or-routing-layer]/
      page.tsx
      layout.tsx
  components/
    layout/
    navigation/
    sections/
      home/
      about/
      skills/
      projects/
      resume/
      contact/
      footer/
    ui/
  content/
    profile/
    skills/
    projects/
    resume/
  features/
    i18n/
    theme/
    contact/
    lightbox/
  lib/
    validation/
    email/
    seo/
  styles/
public/
  images/
```

Exact route folder names depend on the chosen i18n routing pattern.

## Rendering boundaries

Prefer server components for:

- section shells
- static content
- skills/project/resume data loading
- SEO metadata

Use client components only for:

- mobile navigation
- language/theme controls when client state is needed
- tabs
- sliders/carousels
- project selection interaction
- resume viewer navigation
- lightbox/dialog
- contact form submission state

Do not mark large page trees as client components just to support one interactive child.

## Content repository layer

Introduce an interface boundary even when content is local:

```ts
interface PortfolioRepository {
  getProfile(locale: Locale): Promise<ProfileView>;
  getSkills(locale: Locale): Promise<SkillView[]>;
  getFeaturedProjects(locale: Locale): Promise<ProjectView[]>;
  getResume(locale: Locale): Promise<ResumeView>;
}
```

MVP implementation can import local typed modules. Future CMS implementation can satisfy the same contract.

## Internationalization

Initial locales: English and Vietnamese.

Requirements:

- locale switcher preserves the current logical page/section where practical
- metadata has locale-aware title/description
- canonical/hreflang strategy defined before production
- no hard-coded user-facing strings in interactive components unless intentionally locale-neutral

## Theme

Requirements:

- light
- dark
- system preference support if desired
- avoid hydration flashes
- theme tokens implemented centrally

## Contact architecture

Recommended flow:

```text
Form
  -> client/server validation
  -> server action or route handler
  -> rate-limit + honeypot checks
  -> email provider
  -> typed result
  -> success/error UI
```

Do not expose provider secret keys to the client.

## Abuse controls

MVP baseline:

- hidden honeypot
- minimum/maximum field lengths
- email validation
- server-side rate limit
- no HTML rendering from raw form input

Add CAPTCHA only if real abuse justifies the added friction.

## Resume lightbox

Use one reusable dialog/lightbox component rather than custom popups per resume entry.

Requirements:

- portal/overlay
- focus trap
- Escape close
- close button
- restore focus
- scroll lock
- responsive image bounds

## Images

- keep originals where needed for lightbox
- generate/use optimized display variants
- explicit width/height or aspect ratio
- meaningful alt text
- avoid loading every full-resolution resume image at initial page load

## SEO

At minimum:

- locale-aware metadata
- canonical URL
- Open Graph/Twitter metadata
- sitemap
- robots
- structured data for Person/WebSite where appropriate
- redirect map from old WordPress URLs

Do not remove indexed legacy content until redirects are verified.

## Analytics

Optional MVP analytics should be privacy-conscious and should not block rendering. Keep analytics provider behind a small abstraction.

## CMS phase

After MVP:

- Supabase Postgres for structured content
- Supabase Storage for managed media if desired
- authenticated admin route
- translation-aware editing
- publish/order/featured controls
- content validation

The CMS must implement the same view models used by the local repository layer.

## Security

- no secrets in Git
- `.env.example` contains names only
- server-only provider credentials
- sanitize/escape user-provided content
- validate external URLs before rendering admin-managed links
- dependency updates handled through normal maintenance, not ad hoc during unrelated feature work
