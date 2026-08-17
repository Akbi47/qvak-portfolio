# Owner Decisions & Pre-Cutover Evidence — Production Content Migration (#16)

Source of truth for decisions: `docs/migration/wordpress-content-inventory.md`.
Owner: Khoa (repo owner). This document captures what must be decided before issue #16 (content migration) and #17 (cutover) can proceed. Nothing here is a decision; every item is an open question with acceptance criteria so the owner can answer once and implementation can proceed without guessing.

The inventory rule is explicit: **unknowns must not be filled with guessed content.** This document makes the unknowns answerable.

---

## 1. Owner-decision questionnaire

Each item records the current state in the repository and what is required to accept it. Answer each in the issue #46 thread.

### D1 — Final English/Vietnamese copy

- **Current state:** `src/content/profile.ts`, `src/content/skills.ts`, `src/content/projects.ts`, `src/content/resume.ts`, `src/content/contact.ts`, `src/content/footer.ts` contain draft bilingual copy treated as *source material*.
- **Question:** Approve the current EN/VI copy as final, or provide corrections per string?
- **Acceptance:** Every user-facing string across all content files is owner-approved for both locales.

### D2 — Featured project set + real Live Demo / Code URLs

- **Current state:** All 6 case-study posts from the inventory are marked `featured: true` in `src/content/projects.ts`. Live Demo destinations include YouTube links for `comestic-beauty-store`, `bakery-store`, `dynamic-global-solution-landing-page`, `scented-candles-store`; `dynamic-global-solution-landing-page` also has a GitHub code URL. `atm-seeking` and `readingtime` have no Live Demo/Code URL.
- **Inventory context:** `/case-studies/` → `/#projects` redirect is *decided conditionally* — gated on "Approved Projects section represents the collection." Per-post destinations are `Keep candidate` / `Mapping required`.
- **Question:** Which projects are featured, in what order, and what are the **real** Live Demo and Code destinations for each (or explicitly none)?
- **Acceptance:** Featured set matches the owner-approved list; every Live Demo/Code URL is verified live by the owner; missing destinations are intentionally omitted (no placeholder links).

### D3 — Public permission for employer/client names and supporting employment evidence

- **Current state:** `src/content/resume.ts` publishes employer names: Dynamic Global Solutions, EnglishWing, SmartIT, Zenitech. The Dynamic Global Solution landing page project references the same company. The inventory also lists supporting employment evidence such as the **EnglishWing employment confirmation** (`quachvoanhkhoa-certificate-2.jpg` in `docs/migration/legacy-assets/`) as `Archive / Replace` — "Contains signatures, seal, and employment document text. Keep privately unless an explicitly approved redacted derivative is needed."
- **Inventory context:** "Verify employer naming, dates, confidentiality, and approved public wording" and whether employment-confirmation evidence may be publicly referenced.
- **Questions:**
  1. Is each employer/client name + project reference approved for public display? Any rewordings required?
  2. May any supporting employment evidence (e.g. the EnglishWing confirmation) be publicly referenced or published? If so, under what derivative/redaction policy?
- **Acceptance:** Every employer/client name and project association is explicitly approved or corrected; the publication/redaction status of supporting employment evidence is explicitly decided (private / public-with-redaction / text-only reference), with no silent assumption either way.

### D4 — Certificate publication / redaction policy

- **Current state:** Resume entries reference education and certifications (Bachelor's degree, TOEIC, Basic IT Application Certificate, Codeforces profile). No certificate images are wired into `src/content/resume.ts` media, but `docs/migration/legacy-assets/` contains raw certificate JPEGs.
- **Inventory context:** Raw certificate images contain birth/credential identifiers; "raw public use is not approved."
- **Question:** Which certificates publish structured text only vs. an approved redacted derivative? What is the redaction policy?
- **Acceptance:** Certificate media policy is explicit; any published derivative is owner-approved and redacted; raw originals stay out of `public/`.

### D5 — Current downloadable CV file + stable URL

- **Current state:** No `resumeUrl` in `src/content/profile.ts`. No CV file is wired.
- **Inventory context:** Old WordPress-upload CV PDFs are `Unknown / Replace` — "Obtain one current, owner-approved CV and decide its stable production URL."
- **Question:** Is there a current CV to publish? If so, what file (outside `legacy-assets/`) and what stable URL?
- **Acceptance:** CV (if any) is a current owner-approved file with a decided stable URL; old upload URLs are handled per a decided redirect/retention policy.

### D6 — Blog-retention mechanism

- **Current state:** No blog UI or hosting in the MVP. `/blog/` and the four tech-blog posts are `Migrate later` — "retain the URL/content until a separate blog migration or retirement plan is approved." Hosting mechanism unresolved.
- **Question:** Which mechanism — staged content migration, retained legacy hosting, or archive/410 — and when?
- **Acceptance:** A mechanism is chosen (see Section 4 for options); the chosen mechanism is recorded here with an owner-approved timeline.

### D7 — Per-route 410 / redirect handling for non-migrated case studies and low-value archives

- **Current state:** Only `/resume/` → `/#resume` and `/case-studies/` → `/#projects` redirects are implemented (and `/resume/` is gated on content verification). Case-study post URLs, categories, tags, author, `/blocks/*` remain candidates.
- **Inventory context:** "Later, redirect archives to an equivalent collection only if it exists; otherwise evaluate `410 Gone` after checking Search Console/backlinks. Do not redirect all secondary URLs to the homepage."
- **Question:** For each remaining route group, what is the decision (equivalent collection redirect, retain, or 410) after Search Console/backlink review?
- **Acceptance:** Per-route-group handling is decided; no blanket homepage redirects.

### D8 — Contact / social destinations

- **Current state:** `src/content/contact.ts` publishes GitHub (`https://github.com/Akbi47`) only. No verified email, phone, or location.
- **Inventory context:** "The live destinations were not accepted as final content by Issue #2; verify each before publication."
- **Question:** Which contact/social destinations are final (GitHub, email, LinkedIn, etc.)? Are email/phone/location intentionally public?
- **Acceptance:** Contact/social values are owner-approved and verified; absent values are intentionally omitted.

### D9 — About FEAON role

- **Current state:** The legacy homepage's "About FEAON / mission copy" was `Archive`d (excluded from the personal portfolio MVP). No About FEAON block exists in the current site.
- **Question:** Does About FEAON have any approved future role in the personal portfolio? If yes, what?
- **Acceptance:** A decision is recorded (include/never/include differently).

### D10 — Complete uploads inventory

- **Current state:** `docs/migration/wordpress-content-inventory.md` notes the uploads export is "Incomplete / unknown" for homepage portraits/logo and some inline post media. The local `legacy-assets/` is a partial subset.
- **Question:** Where is the verified, complete `wp-content/uploads` export, and which originals map to which production assets?
- **Acceptance:** A verified uploads inventory exists (kept outside this repo) covering all production media references.

---

## 2. Draft-content gap audit (current `src/content/*` vs. inventory)

This flags every place current content relies on an unresolved inventory decision. Flagged items must not ship to production until resolved.

| File | Item | Status vs. inventory | Blocker |
|---|---|---|---|
| `src/content/projects.ts` | All 6 case studies `featured: true` | Draft; featured set unapproved | D2 |
| `src/content/projects.ts` | YouTube `liveDemoUrl` for 4 projects; GitHub code for DGS landing | Destinations unverified/unapproved | D2 |
| `src/content/projects.ts` | `atm-seeking`, `readingtime` no Live Demo/Code | Intentionally omitted? unconfirmed | D2 |
| `src/content/projects.ts` | Dynamic Global Solution references company name | Publication permission unverified | D3 |
| `src/content/resume.ts` | Employer names (DGS, EnglishWing, SmartIT, Zenitech) | Publication permission unverified | D3 |
| `docs/migration/legacy-assets/` | EnglishWing employment confirmation (`quachvoanhkhoa-certificate-2.jpg`) | Publication/redaction status undecided | D3 |
| `src/content/resume.ts` | Education/cert entries (degree, TOEIC, IT cert, Codeforces) | Text-only; media policy unresolved | D4 |
| `src/content/resume.ts` | `media` arrays empty (no certificate images wired) | Consistent with "no raw publication"; needs policy | D4 |
| `src/content/profile.ts` | No `resumeUrl` | CV unknown | D5 |
| `src/content/contact.ts` | GitHub only; no email/phone/location | Destinations unverified | D8 |
| `src/content/footer.ts` | Socials reuse GitHub only | Destinations unverified | D8 |
| `src/proxy.ts` | `/resume/` → `/#resume`, `/case-studies/` → `/#projects` | Implemented; `/resume/` gated on content approval | D1–D5 (content), D7 (secondary routes) |

---

## 3. Proposed acceptance criteria for issue #16

GitHub issue #16 already defines seven acceptance criteria:

1. No placeholder/sample personal data remains in production sections.
2. All external links are real and verified.
3. Missing optional links are omitted rather than faked.
4. EN/VI content is complete for launch-critical UI.
5. Image alt text and media dimensions are supplied.
6. No private/unapproved personal data is published.
7. `lint`, `typecheck`, content validation/tests, and build pass.

The criteria below are **additive/refined** — they do not replace the above; they operationalize how the owner decisions (D1–D10) satisfy #16's existing criteria:

1. Featured project set and order match the owner-approved list (D2) — satisfies #16 criterion 1/2.
2. Every rendered Live Demo/Code URL is owner-verified live; missing destinations are intentionally omitted (D2) — satisfies #16 criterion 2/3.
3. No unapproved employer/client name or certificate media is published (D3, D4) — satisfies #16 criterion 6.
4. CV file and URL (if any) are decided and wired (D5) — satisfies #16 criterion 1/2.
5. Contact/social destinations match the owner-approved set (D8) — satisfies #16 criterion 2.
6. Final EN/VI copy is owner-approved across all content files (D1) — satisfies #16 criterion 4.
7. No bytes from `docs/migration/legacy-assets/` are moved into `public/` or the runtime bundle — supports #16 criterion 6.
8. Redirect activation follows decisions (D7): `/resume/` and `/case-studies/` only after content approval; no blanket homepage redirects. *(Additional cutover guard — does not map to an existing #16 criterion; it governs when already-implemented redirects in `src/proxy.ts` may be relied upon at production cutover, tracked under #17.)*

---

## 4. Blog-retention mechanism options (analysis only — choice is owner's)

The blog is `Migrate later`; the hosting mechanism is the unresolved decision (D6).

| Option | Description | Pros | Cons | Decision criteria |
|---|---|---|---|---|
| A. Staged content migration | Migrate the 4 blog posts into the Next.js app (separate scope) with retained slugs | Single stack, SEO continuity, no legacy dependency | Scope beyond MVP; content review needed | Blog is valuable long-term; timeline allows |
| B. Retained legacy hosting | Keep WordPress serving `/blog/` + posts while Next.js serves the rest | Zero migration work; no content loss | Two stacks to operate; redirect/proxy complexity; cost | Short-term, blog rarely updated |
| C. Archive / 410 | Remove blog from sitemap, serve 410 after backlink/index review | Clean cutover | Loses indexed content; needs Search Console evidence | Blog has no ongoing value; backlinks negligible |

Recommended evaluation order: check Search Console/backlink value first, then choose A if the blog is worth keeping, C if not, B only as a transitional measure.

---

## 5. Pre-cutover evidence checklist (owner-executable)

These are external operational prerequisites from the inventory. **All private artifacts live outside this repository.** Nothing below is committed to the repo.

- [ ] Export the WordPress database; record export time, WP version, and integrity/checksum evidence in an approved private location.
- [ ] Export all required `wp-content/uploads` originals to an approved private location (not just the local Issue #2 subset).
- [ ] Preserve current sitemap XML, REST content/metadata, redirect/plugin configuration, and permalink settings.
- [ ] Export Search Console indexed URLs, top landing pages, backlinks if available, and recent 404s.
- [ ] Verify both database and uploads backups can be read/restored before any destructive change.
- [ ] Record backup owner, storage location, retention period, rollback owner, and rollback decision point outside the public repository.
- [ ] Re-crawl immediately before cutover and diff against the 2026-08-12 snapshot.
- [ ] Confirm the blog-retention mechanism (D6) is chosen and operational.
- [ ] Confirm D1–D10 answers are recorded and reflected in `src/content/*`.
- [ ] Verify per-route handling (D7) against the pre-cutover URL export.

---

## Related

- Issue #46 (this decision capture)
- `docs/migration/wordpress-content-inventory.md`
- `docs/06-issue-breakdown.md` (roadmap; #46 gates #16)
