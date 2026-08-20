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
- **WAL-G automated backups**: enabled (`walg_enabled: true`) — Supabase runs scheduled backups with retention.
- **PITR (point-in-time recovery)**: disabled (`pitr_enabled: false`) — Pro feature; needed for precise recovery and to meet stronger RPO.
- **On-demand physical backups**: none recorded yet.

### Recommended backup procedure

1. **Enable PITR** on the Pro plan (Dashboard → Database → Backups → Enable PITR). This is the single highest-impact recovery improvement and also enables on-demand physical backups.
2. **Take a baseline physical backup** after enabling PITR.
3. **Content** is recoverable via the in-repo backfill script (`npm run backfill`) and the seed script, so a full content rebuild is possible even without DB backups; storage objects (uploaded media) should be backed up via Storage (export/download) since they live in Supabase Storage.
4. **Document the restore path** (below) before a real incident.

### Restore / rollback path

- **Schema / data**: `supabase db reset --linked` restores from the last backup + migrations; or use the Dashboard "Restore" / PITR to a timestamp.
- **Media (Storage)**: re-download objects from a Storage export, or restore via PITR (Storage objects are DB-backed).
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
- Optional (Pro plan): enable leaked password protection and PITR.
- Final browser UI smoke test of the `/admin` forms as the logged-in owner.
