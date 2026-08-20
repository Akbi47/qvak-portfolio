# Production Hardening & CMS Operational Audit — Issue #66

This document records the production hardening and operational audit for the Supabase-backed CMS at `https://khoawatt.com` (cloud Supabase project `qvak-portfolio-dev`, ref `lpxpzxbmmxnikerptcfq`). It follows the completed CMS rollout (Issue #64, `docs/migration/cms-cloud-rollout.md`) and covers the security review, backup/rollback posture, incident/debug workflow, and confirmation that no CMS rollout gaps remain.

## 1. Security review — auth / RLS / storage boundaries

### Applied hardening (this audit)

| Finding | Severity | Action | Status |
|---|---|---|---|
| `anon` retained Supabase-default table grants on the security-sensitive `admin_owner` table (SELECT/INSERT/UPDATE/DELETE). Not exploitable (RLS deny-by-default), but deviated from the accepted #18 design ("anon = zero privileges"). | Low (defense-in-depth) | New migration `20260820200000_cms_hardening_anon_owner_grants.sql` adds `revoke all on public.admin_owner from anon;`. Verified: `anon` now gets a hard `permission denied` on `admin_owner`. | ✅ Applied (local + cloud) |
| Production Auth `site_url` was `http://localhost:3000` (would corrupt email links such as password reset / confirmation). | High | Auth config `site_url` set to `https://khoawatt.com`. | ✅ Applied |
| Auth signup was enabled at the provider level (`disable_signup=false`). The app has no public registration route, but provider-level signup is an unnecessary surface. | Medium | Auth config `disable_signup=true`. Verified: new signup returns "Signups not allowed for this instance". | ✅ Applied |
| Auth `password_min_length` was 6. | Low | Raised to 8. | ✅ Applied |
| Leaked password protection (HIBP) disabled. | Low | **Requires Pro plan** (HaveIBeenPwned check is Pro-only). Not applied; documented for the owner to enable after a plan upgrade. | 📌 Owner / Pro |
| Point-in-time recovery (PITR) disabled; no on-demand physical backups recorded. | Medium | Requires Pro plan (PITR). Documented below; recommend enabling after upgrade. | 📌 Owner / Pro |

### Verified-OK (no action needed)

- **RLS on every content table**: all 17 `public` tables have RLS enabled (verified via `pg_class.relrowsecurity`).
- **Content tables: `anon` has zero grants** (revoked in the schema migration).
- **`anon` cannot read/write `admin_owner`** (verified: permission denied / RLS).
- **Storage buckets**: `resume-media` private, `project-media`/`portfolio` public, each 10 MB. Storage RLS: `owner all objects` (owner-only writes), public SELECT on the two public buckets only; `resume-media` has no public/anon read.
- **Anonymous storage**: upload denied, private-bucket read denied (runtime-verified).
- **Single owner**: one `auth.users` row (`admin@khoawatt.com`) mapped to one `admin_owner` row; no other users.
- **No service-role / private media URL** exposed in client bundles (verified in rollout).
- **Owner session + media through owner RLS**: login + upload/list/delete verified in production (Issue #64).
- **Security advisor**: no security findings beyond the Pro-gated leaked-password setting.

## 2. Backup & recovery posture

Production project status (via Management API, 2026-08-20):

- **Plan**: Free tier.
- **Automatic daily backups**: **not available on the Free tier.** Supabase automatically backs up Pro/Team/Enterprise plans only; the Free tier has no scheduled database backups. (A `walg_enabled` flag existing in the project does not mean Free projects get daily backups.)
- **PITR (point-in-time recovery)**: disabled (`pitr_enabled: false`) — Pro add-on; needed for precise recovery and to meet a stronger RPO.
- **On-demand physical backups**: none recorded yet.

### Recommended backup procedure (current Free-tier posture)

1. **Maintain your own off-site logical backups now** (Free tier has no automatic backups): regularly run `supabase db dump` (logical) and store the output off-site. This is the currently-runnable recovery path and satisfies Issue #66's "clearly runnable" requirement.
2. **Back up Storage objects separately.** Supabase **database backups do not include Storage API object files** — Postgres stores only object metadata. Uploaded media must be backed up by downloading/exporting the Storage buckets (`resume-media`, `project-media`, `portfolio`).
3. **Content rebuild fallback**: the in-repo backfill script (`npm run backfill`) + seed script can rebuild the content tables from the local typed source of truth, independent of DB backups.
4. **Enable PITR on the Pro plan** (Dashboard → Database → Backups → Enable PITR) when a stronger RPO is acceptable. PITR also enables on-demand physical backups. Until then, rely on logical dumps.

### Restore / rollback path

- **Schema / data (current Free tier)**: restore from your logical `db dump` using `supabase db restore` / `psql`, or rebuild content via `npm run backfill`. ⚠️ **Do NOT use `supabase db reset --linked` on production** — it destroys the linked remote database and rebuilds from local migrations; it is intended only for disposable local/dev projects.
- **Schema / data (after enabling paid backups)**: use the Dashboard "Backups" / PITR restore to a timestamp.
- **Media (Storage)**: restore from a separate Storage export/copy of the buckets. ⚠️ A database/PITR restore does **not** recover Storage object files (only their metadata); deleted/overwritten media requires the Storage backup.
- **Deploy**: production is git-integrated; roll back by redeploying a prior production commit.
- **Content**: re-run `npm run backfill` from the local typed content (the source of truth fallback).

## 3. Incident / debug workflow

- **Runtime logs**: Vercel project logs (Dashboard → Project → Logs) cover server functions, edge functions, and build logs. Filter by environment (production), time range, and search for `supabase`/error patterns.
- **Database logs**: Supabase Dashboard → Database → Logs (Postgres) or `supabase db query --linked` for direct diagnostics.
- **Auth issues**: check Auth → Users in the Dashboard; confirm the owner row and that signup is disabled.
- **Revalidation**: CMS mutations trigger `revalidatePath`; if a change does not appear publicly, revalidate the affected section (Projects/Resume) or check the `resume.publicity` setting (`app_settings`), which fails closed to private.
- **Common failure modes**:
  - Resume media returns 404 → `resume.publicity` is not `visible` (or read failed → fail-closed private). Intended behavior.
  - Admin upload/delete fails → Storage RLS / owner session issue; confirm the owner is signed in and the bucket/path is correct.
  - Public page shows stale content → cache revalidation not triggered; revalidate or clear the affected path.
  - Email links broken → confirm Auth `site_url` is `https://khoawatt.com` (fixed this audit).
- **Escalation**: production mutations and restores are human-gated per AGENTS.md.

## 4. CMS rollout gap check (Issue #64)

Re-confirmed with no remaining gaps: all 8 CMS migrations applied; owner login + media through owner RLS verified; `resume.publicity` toggles live without redeploy; preflight 19/19; storage RLS allow/deny both verified.

**Outstanding owner/human actions (not code):**
- Change the temporarily reset production owner password (temp value at `/tmp/qvak-owner-temp-password.txt`; delete the file after rotating).
- Start regular off-site logical backups (`supabase db dump`) + a separate Storage export of the media buckets (Free tier has no automatic backups).
- Optional (Pro plan): enable leaked password protection and PITR.
- Final browser UI smoke test of the `/admin` forms as the logged-in owner.
