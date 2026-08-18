# Cutover Preflight Runbook

This runbook defines the in-repo, version-controlled verification for the WordPress → Next.js cutover (Issue #17). It pairs the automated preflight script with the manual operator gates that require external access.

Owner policy source: `docs/migration/owner-decision-capture.md` (D7 redirect policy) and `docs/migration/wordpress-content-inventory.md` (redirect worksheet, pre-cutover preservation gates).

## When to run

Run before and immediately after the production release cutover to `khoawatt.vercel.app` (replacing the legacy WordPress site at `quachvoanhkhoa.feaon.com`). The automated preflight should be **green** (no `FAIL` entries) before DNS/cutover, and re-run after cutover to confirm the live domain behaves as intended.

## Prerequisites (external, human-executed)

These gates are **not** automated and remain outside this repository. They must be satisfied before the destructive cutover steps in Issue #17:

- [ ] Verified WordPress database and `wp-content/uploads` backups exist and can be restored.
- [ ] Current sitemap XML, REST metadata, redirect/plugin configuration, and permalink settings are preserved.
- [ ] Search Console indexed URLs, top landing pages, backlinks, and recent 404s are exported.
- [ ] Backup owner, storage location, retention period, rollback owner, and rollback decision point are recorded outside the repo.
- [ ] A pre-cutover re-crawl of the legacy sitemaps is diffed against the 2026-08-12 inventory snapshot.
- [ ] The blog-retention mechanism (D6: no blog in the MVP) is confirmed and any transition is agreed.
- [ ] Contact delivery is configured with the production provider credentials (never committed to the repo).
- [ ] Hosting/Vercel, DNS/TLS, and domain registrar access are available to the operator.

## Run the automated preflight

```bash
npm run preflight                 # default: production origin
npm run preflight -- --origin=https://example.com   # any origin
PREFLIGHT_ORIGIN=https://example.com npm run preflight
```

The script performs no writes and stores no credentials. Exit code `0` means no `FAIL` checks; exit code `1` means at least one `FAIL` check.

### Checks performed

| Check | Verifies |
|---|---|
| EN root `/`, VI root `/vi` | Both locale roots render with HTTP 200 |
| Legacy redirects (`/resume/`, `/case-studies/`, `/atm-seeking/`, `/vi/case-studies/`, `/blog/`, `/blocks/footer/`, `/tag/nextjs/`) | Permanent `301` with the exact `Location` from the D7 matrix |
| Homepage metadata | `<title>`, canonical link, hreflang `en`/`vi`/`x-default` |
| `/sitemap.xml`, `/robots.txt` | 200 and correct content (urlset + sitemap reference) |
| Public image asset | A production image returns 200 |
| Resume-media gate (`/api/resume-media/transcript.jpg`) | Reports 404 (private default) or 200 (visible); 5xx is a failure |
| Contact section | The homepage renders `id="contact"` |

## Manual smoke checklist (post-cutover)

The automated script cannot cover interactive behavior. Confirm in a browser at mobile/tablet/desktop widths:

- [ ] EN and VI navigation, theme toggle, and locale switcher work.
- [ ] `/#projects` selector shows all six projects with live demo/code links.
- [ ] Resume section lock overlay shows while publicity is `private`.
- [ ] While publicity is `visible`: certificate lightbox opens and images load.
- [ ] Contact form submits and delivers through the production provider (requires provider credentials).
- [ ] Newsletter form behaves (validation/subscribe result).
- [ ] No legacy WordPress secrets, backups, or private files are reachable.

## Expected behaviors to note

- Resume-media returns `404` by default (`sections.resume.publicity = "private"`) and `200` only while `visible`. The preflight reports this as informational; treat a `404` as correct unless you intend to publish the resume.
- The D7 policy is: legacy URL with a meaningful equivalent → that equivalent; no equivalent → the homepage. A `301` to `/#projects`/`/#resume` or to `/` (localized) is correct per the matrix.

## Known limitations

- **Old WordPress CV PDF URLs** are not in the matrix — the exact upload paths are not recorded in the inventory. They are not redirected; a future decision (D5) must supply a stable CV URL or a retention/redirect rule before any redirect is added.
- **Contact delivery** is only reachability-checked (section renders). Live delivery requires a manual form submit against the production provider.
- **Search Console/backlink evidence** for tags and archives remains a human gate (owner-decision §5); the automated checks only confirm the redirect response.
- **Blog** is not served by the MVP (D6); legacy blog URLs redirect to the homepage per D7. If a blog migration is later approved, remove those routes from the homepage group in `src/features/seo/redirects.ts`.

## Related

- Issue #17 (operational cutover) — this runbook is its preflight input.
- `docs/migration/owner-decision-capture.md` (D1–D10).
- `docs/migration/wordpress-content-inventory.md` (§ redirect worksheet, § pre-cutover preservation gates).