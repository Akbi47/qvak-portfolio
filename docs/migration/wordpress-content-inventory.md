# WordPress Content and Redirect Inventory

Source site: `https://quachvoanhkhoa.feaon.com`

Snapshot date: **2026-08-12**

## Purpose and limits

This is the Phase 0 migration worksheet for Issue #2. It records content and URL decisions before SEO implementation or production cutover; it does not authorize UI work, redirects, asset publication, or destructive WordPress changes.

Evidence used:

- the live Yoast sitemap index and child sitemaps
- the public WordPress REST API for published pages, posts, taxonomies, and page media references
- the seven-page local print-to-PDF export of the legacy `/resume/` page
- the six local resume-related JPEG files under `docs/migration/legacy-assets/`
- the accepted product brief, information architecture, and implementation plan

The local PDF and JPEG files are **partial source evidence**, not a verified WordPress database export or complete `wp-content/uploads` backup. Live WordPress content can change after this snapshot. Re-crawl the sitemaps and compare Search Console data immediately before cutover.

## Decision vocabulary

- **Keep** — retain the information in the MVP, subject to copy review.
- **Migrate later** — preserve the source and URL now; implement only in a separately approved scope.
- **Replace** — retain the source privately, but publish approved text or a redacted/current derivative instead of the original.
- **Archive** — preserve for provenance or rollback; do not expose in the MVP by default.
- **Unknown** — owner input or external evidence is still required; do not guess.

## Homepage content

| Legacy content | Decision | Target or handling | Notes / unknowns |
|---|---|---|---|
| “Hi There! I am Khoa…” profile introduction | Keep | `/#about` locale content | Treat the WordPress copy as source material, not final copy. English and Vietnamese approval is still required. |
| Name and Fullstack Developer positioning | Keep | `/#home` and `/#about` | Final role wording remains owner-approved content. |
| Featured Case Studies block | Keep selectively | `/#projects` | Do not import every entry automatically; owner must approve the featured set and real Live Demo/Code destinations. |
| ATM Seeking summary and image | Keep candidate | `/#projects` | It is the only project featured directly on the observed homepage, but final featured status remains unapproved. |
| Blog previews | Migrate later | No MVP homepage blog section | Preserve article sources and URLs as described in the blog decision below. |
| About FEAON / mission copy | Archive | No personal-portfolio MVP destination | Canonical product docs exclude this generic brand block unless the owner explicitly approves it later. |
| Contact/social destinations | Keep after verification | `/#contact` and footer | The live destinations were not accepted as final content by Issue #2; verify each before publication. |
| Legacy navigation, theme markup, map embed, page-builder blocks, and repeated Contact widget | Archive | No direct migration | Structural evidence only; do not migrate WordPress/theme implementation. |

## Resume content inventory

The local PDF is a browser export of `/resume/`, not the downloadable CV itself. Its information hierarchy is:

### Career Journey — Keep as editable source

| Entry | Legacy date | Source summary | Migration note |
|---|---|---|---|
| Dynamic Global Solutions | 2024–Present | Fullstack development and maintenance for products including QR food ordering and real-time chat | Verify employer naming, dates, confidentiality, and approved public wording. |
| EnglishWing | 2024 | Backend work on an LMS with frontend and DevOps collaboration | Verify dates and whether the employment confirmation image may be referenced publicly. |
| SmartIT | 2023 | Fullstack work on vehicle booking/management for the Japanese market | Verify employer naming and approved public project detail. |
| Zenitech | 2020–2023 | WordPress/SEO development, layout work, performance optimization, and Google Ads | Verify dates and final role wording. |

### Education & Certifications

| Item | Decision | Source content | Migration note |
|---|---|---|---|
| Bachelor’s degree, Electronics–Telecommunications Engineering, University of Science, VNU-HCM | Keep | 2018–2023, Good classification, GPA 7.72; legacy copy also claims top-two faculty admission score | Owner must verify the admission claim and choose approved bilingual wording. Prefer structured text plus an approved/redacted image derivative. |
| Academic transcript | Archive / Replace | Local image supports academic record | Contains personal/credential details. Do not publish the raw original by default. |
| TOEIC | Keep / Replace | Legacy copy records Listening + Reading 775 and Speaking + Writing 330 | Verify scores and validity/currentness. Publish structured text and only an approved redacted derivative. |
| Basic IT Application Certificate | Keep / Replace | Issued by the University of Science IT Center in 2019; theory 8.3 and practical 9.7 | Verify the English title. Publish structured text and only an approved redacted derivative. |
| Codeforces Expert profile | Keep after live verification | Legacy handle `anhkhoaquachvo` | Prefer a current profile link and current rank text over the stale screenshot. |
| Downloadable CV | Unknown / Replace | Legacy pages reference two WordPress-upload PDF URLs | Obtain one current, owner-approved CV and decide its stable production URL before redirecting old upload URLs. |

### Explicit `/resume/` route decision

**Decision:** after the new Resume section contains equivalent approved content, permanently redirect `/resume/` to `/#resume`.

The MVP is a long-scroll portfolio and does not require a dedicated resume route. The redirect must not go live before the target section exists and the career, education, certificate, and media content has been verified. Preserve the legacy page and its source files until the redirect and analytics/Search Console checks pass.

## Local legacy source manifest

All files below currently remain under `docs/migration/legacy-assets/`. Preserve their filenames and bytes during Issue #2; do not move them into `public/` or commit them as production assets in this PR.

| Local file | Dimensions / type | Supports | Decision | Publication/privacy note |
|---|---|---|---|---|
| `Resume - Portfolio Quách Võ Anh Khoa.pdf` | PDF, 7 pages | Full legacy `/resume/` layout and content hierarchy | Archive | Browser-rendered evidence only; includes legacy navigation/footer/map and embedded personal records. Not the canonical downloadable CV. |
| `quachvoanhkhoa-certificate-2.jpg` | 1920×2560 JPEG | EnglishWing employment confirmation | Archive / Replace | Contains signatures, seal, and employment document text. Keep privately unless an explicitly approved redacted derivative is needed. |
| `quachvoanhkhoa-certificate-3.jpg` | 2560×1920 JPEG | Bachelor’s degree | Keep source / Replace public copy | Contains birth and credential identifiers. Prefer structured text plus an approved redacted derivative. |
| `quachvoanhkhoa-certificate-4.jpg` | 1920×2560 JPEG | Academic transcript | Archive / Replace | Contains detailed academic and personal identifiers; raw public use is not approved. |
| `toeic-cer.jpg` | 2397×1892 JPEG | TOEIC Listening/Reading and Speaking/Writing certificates | Keep source / Replace public copy | Contains portrait, birth date, and score-report identifiers. Redaction and owner approval are required before publication. |
| `quachvoanhkhoa-certificate-1.jpg` | 2047×1394 JPEG | Basic IT Application Certificate | Keep source / Replace public copy | Contains birth and certificate identifiers. Redaction and owner approval are required before publication. |
| `codeforces-cer.jpg` | 1603×1002 JPEG | Codeforces Expert profile | Replace | Screenshot contains an email address and may become stale. Use a verified live profile URL/current text instead. |

No raw source in this table is approved for production merely because the legacy WordPress page displayed it.

## Published route inventory

### Primary pages

| Legacy route | Observed role | Decision |
|---|---|---|
| `/` | Home, profile, featured project, blog previews, About FEAON | Keep at `/`; migrate only approved portfolio content. |
| `/resume/` | Career, education, certificates, CV link | Redirect to `/#resume` only after equivalent content is live. |
| `/case-studies/` | Six-project index | Redirect to `/#projects` only after the new Projects section represents the approved set. |
| `/blog/` | Four-article index | Migrate later; retain the URL/content until a separate blog migration or retirement plan is approved. |

### Case Study posts

| Legacy route | Title | Primary legacy media | Decision / redirect gate |
|---|---|---|---|
| `/atm-seeking/` | ATM Seeking | `6639678bd5b43f509d453388_ATM-Comunv2.jpg` | Keep candidate. Redirect to equivalent project content only after it exists; otherwise retain the legacy URL. |
| `/readingtime/` | ReadingTime | `reading-time.jpg` | Keep candidate; featured status and destination unknown. |
| `/comestic-beauty-store/` | Comestic & Beauty Store | `comestic-ava.jpg` | Keep candidate; preserve the misspelled legacy slug for redirect compatibility. Featured status unknown. |
| `/bakery-store/` | Bakery Store | `cake-ava-1.jpg` | Keep candidate; featured status and destination unknown. |
| `/dynamic-global-solution-landing-page/` | Dynamic Global Solution Landing Page | `DGS.webp` | Keep candidate; verify client/employer publication permission and destination. |
| `/scented-candles-store/` | Scented Candles Store | `candle-with-label.webp` | Keep candidate; featured status and destination unknown. |

Preserve the six original project media files from WordPress uploads before cutover. Do not download or move them into the Next.js runtime in Issue #2. Each post may contain additional media not represented by its sitemap image; the full uploads export remains required.

### Tech Blog posts

**Blog decision:** migrate later. A blog rebuild is not part of MVP. Preserve the four articles, their media, metadata, and current slugs, and keep serving their legacy URLs until a separately approved migration or retirement plan provides equivalent destinations. Do not redirect unrelated articles to `/` or `/#projects` merely to eliminate 404s.

| Legacy route | Title | Media to preserve with source | Decision |
|---|---|---|---|
| `/what-is-a-web-server/` | What is a web server | `web-server-la-gi-2.jpg`, `web-server.jpg` | Migrate later; retain URL. |
| `/identify-a-seo-standard-website/` | Identify a SEO standard website | `web-chuan-seo-la-gi.jpg` | Migrate later; retain URL. |
| `/javascript-code-compilation-process/` | JavaScript compilation process | `qua-trinh-bien-dich-js-code-2.jpg`, `qua-trinh-bien-dich-js-code.jpg` | Migrate later; retain URL. |
| `/a-brief-introduction-to-nextjs/` | A brief introduction to NextJS | `nextjs-seo-2.png`, `nextjs-seo.jpg` | Migrate later; retain URL. |

The mechanism for serving retained blog URLs after the main Next.js cutover is unresolved. It must be designed before cutover (for example, a staged content migration or explicitly retained legacy hosting); Issue #2 does not choose or implement that infrastructure.

### Secondary indexed/discoverable routes

The 2026-08-12 Yoast sitemaps also expose:

- categories: `/category/case-studies/`, `/category/tech-blog/`
- author archive: `/author/superuser/`
- tags: `/tag/cloud/`, `/tag/ecommerce/`, `/tag/edtech/`, `/tag/fb/`, `/tag/health-beauty/`, `/tag/javascript-news/`, `/tag/landing-page/`, `/tag/lifestyle/`, `/tag/lms/`, `/tag/nestjs/`, `/tag/nextjs/`, `/tag/nextjs-news/`, `/tag/reactjs/`, `/tag/seo-news/`, `/tag/utility/`, `/tag/web/`, `/tag/web-news/`, `/tag/wordpress/`
- template blocks: `/blocks/header/`, `/blocks/recent-case-studies/`, `/blocks/recent-posts/`, `/blocks/footer/`

Taxonomy/author URLs should remain with the retained blog/case-study content until the relevant migration decision is implemented. Later, redirect archives to an equivalent collection only if it exists; otherwise evaluate `410 Gone` after checking Search Console/backlinks. Template-block URLs have no standalone content equivalent: remove them from the new sitemap and treat `410 Gone` as the cutover candidate after backlink/index checks. Do not redirect all secondary URLs to the homepage.

## Redirect worksheet

No redirect below is implemented by Issue #2.

| Legacy URL or group | Planned destination/behavior | Status | Gate before activation |
|---|---|---|---|
| `/` | `/` | Keep | New homepage content approved and deployed. |
| `/resume/` | Permanent redirect to `/#resume` | Decided, not implemented | Equivalent Resume section live; content/media/privacy review complete. |
| `/case-studies/` | Permanent redirect to `/#projects` | Decided conditionally | Approved Projects section represents the collection. |
| Six Case Study post URLs | Equivalent project detail or selected state; otherwise retain | Mapping required | Featured set and per-project destination approved. |
| `/blog/` and four Tech Blog post URLs | Retain now; migrate later | Decided, hosting mechanism unresolved | Content/export verified and post-MVP blog or retirement plan approved. |
| `/category/case-studies/` | Equivalent projects collection if one exists | Candidate | Backlink/index check and equivalent destination. |
| `/category/tech-blog/`, blog tags, author archive | Retain with blog; later map to equivalent blog collection or evaluate `410` | Candidate | Blog decision plus Search Console/backlink evidence. |
| Case-study tags | Equivalent project collection only where semantically valid; otherwise evaluate `410` | Candidate | Per-tag relevance and backlink/index check. |
| `/blocks/*` | Remove from sitemap; candidate `410 Gone` | Candidate | Confirm no meaningful backlinks or intended standalone content. |
| Old WordPress-upload CV PDFs | One owner-approved stable CV URL, or retain/archive without public redirect | Unknown | Current CV supplied; privacy and cache behavior approved. |

Redirect implementation must preserve query strings where safe, avoid chains, use permanent status only after validation, and be tested against an exact pre-cutover URL export.

## Media preservation worksheet

| Media group | Required action before cutover | Status |
|---|---|---|
| Six project featured images listed above | Export originals and associate each with its post/project record | Identified from live sitemap/API; export not verified |
| Seven blog source images listed above | Export originals with article metadata and alt/caption fields | Identified from live sitemap; export not verified |
| Resume page images and two downloadable CV PDF URLs | Preserve originals privately; select/redact/replace only in later content work | Partially represented locally; complete export not verified |
| Homepage/profile portraits, QVAK logo, map/other theme media | Inventory from full uploads export and decide keep/replace/archive | Incomplete / unknown |
| Supplied new-portfolio portraits and design references | Keep outside runtime until their feature issues select production assets | Available separately from this legacy inventory; not moved by Issue #2 |

WordPress-generated thumbnail variants need not all become production assets, but the original upload must be preserved before deciding which optimized derivatives to generate later.

## Pre-cutover preservation gates

These are external operational prerequisites. Do not commit the resulting database dump, private backup archive, credentials, or other prohibited content to this repository.

- [ ] Export the WordPress database and record export time, WordPress version, and integrity/checksum evidence in an approved private location.
- [ ] Export all required `wp-content/uploads` originals, not only the local Issue #2 subset, to an approved private location.
- [ ] Preserve current sitemap XML, REST content/metadata, redirect/plugin configuration, and permalink settings.
- [ ] Export Search Console indexed URLs, top landing pages, backlinks if available, and recent 404s.
- [ ] Verify that both database and uploads backups can be read/restored before any destructive change.
- [ ] Record backup owner, storage location, retention period, rollback owner, and rollback decision point outside the public repository.
- [ ] Re-crawl immediately before cutover and diff against this 2026-08-12 snapshot.

**Current backup status:** not verified. The local PDF/JPEG subset does not satisfy these gates.

## Unresolved owner decisions

- final English/Vietnamese profile and career copy
- which Case Studies become featured projects and their real Live Demo/Code destinations
- public permission for employer/client names and supporting employment evidence
- whether certificate images are published at all, and the exact redaction/derivative policy
- current downloadable CV file and stable production URL
- blog retention/migration hosting mechanism during the Next.js cutover
- per-route handling for non-migrated Case Studies and low-value taxonomy/archive URLs after Search Console/backlink review
- final contact/social destinations and public contact fields
- whether About FEAON has any approved future role in the personal portfolio
- complete uploads inventory, including homepage portraits/logo and any inline post media omitted from sitemaps

Unknowns above are explicit cutover gates; they must not be filled with guessed content or broad redirects.
