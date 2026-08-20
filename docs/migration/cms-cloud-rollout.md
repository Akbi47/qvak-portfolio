# CMS Cloud Rollout Evidence — Issue #64

This document records the production rollout of the Supabase-backed CMS (Issues #18/#19/#20/#51/#52/#21) to the cloud project, plus the verification evidence and rollback notes. It is the operational completion gate for Issue #64.

## Target environment

- **Supabase project:** `qvak-portfolio-dev` (ref `lpxpzxbmmxnikerptcfq`, Seoul). The single portfolio CMS project; confirmed as the production target with the owner.
- **Vercel project:** `watt6/khoawatt` (production domain `khoawatt.com`).
- **Production deployment:** git `f48c837` (merge of PR #63), auto-deployed from `main` via the GitHub → Vercel integration.

## Migration state

All 8 CMS migrations are applied to the cloud project (verified via `supabase migration list`):

```
20260819204707_cms_schema.sql
20260819212704_content_slug_ids.sql
20260820140000_cms_atomic_mutations.sql
20260820150000_cms_rls_invoker_rpc.sql
20260820160000_cms_projects_crud.sql
20260820170000_cms_projects_preserve_presentation.sql
20260820180000_cms_resume_crud.sql
20260820190000_cms_media_storage.sql   <-- pushed during this rollout
```

## Verification evidence

### Schema / data (remote `--linked` queries)

- Storage buckets: `resume-media` (public=false, private), `project-media` (public=true), `portfolio` (public=true), each 10 MB limit.
- Storage RLS policies on `storage.objects`:
  - `owner all objects` — ALL to `authenticated` gated by `private.is_owner()`, restricted to the 3 buckets.
  - `public read project-media` — SELECT to `anon, authenticated`.
  - `public read portfolio` — SELECT to `anon, authenticated`.
  - `resume-media` has no public/anon SELECT policy (deny-by-default).
- Helpers present: `private.is_owner()`, `private.get_app_setting()`.
- Owner: exactly 1 `admin_owner` row mapping to the single `auth.users` row `admin@khoawatt.com` (no public registration path).
- Content backfilled: 1 profile, 2 profile translations, 6 projects, 17 skills, 1 social link, 8 resume entries, 2 resume categories, 1 `app_settings` row.
- `app_settings('resume.publicity') = 'private'` (fail-closed default).

### Storage RLS runtime check (against the cloud project, anonymous client)

| Operation | Result |
|---|---|
| anon list public `project-media` | ALLOWED (correct) |
| anon upload to `project-media` | DENIED (owner-only write) |
| anon download from private `resume-media` | DENIED (correct) |

### Public site (`https://khoawatt.com`)

- `npm run preflight` — 19/19 PASS (EN/VI roots, legacy redirects, metadata/canonical/hreflang, sitemap/robots, public image, resume-media gate 404/private, contact section).
- `/api/resume-media/*` returns 404 while `resume.publicity=private` (fail-closed).
- `/admin/login` renders 200 ("Admin sign in") — CMS admin wired to the cloud Supabase env.
- Homepage renders CMS-backed project titles matching the cloud DB (e.g. "ATM Seeking", "ReadingTime", "Comestic & Beauty Store").
- No `service_role` / private media URL exposed in client-side HTML.

## Rollback notes

- **DB:** The only mutation pushed during this rollout is migration `20260820190000_cms_media_storage.sql` (creates 3 storage buckets + policies). To roll back: drop the 3 policies on `storage.objects` and delete the 3 buckets (`supabase db reset` on a branch, or manual SQL). The buckets are empty (no objects), so no data loss.
- **Deploy:** Production is driven by the git integration; to roll back to the pre-CMS state, redeploy the prior production commit (`khoawatt-4gcjj3d0y-watt6.vercel.app`, 2h before rollout). No code change was deployed during this rollout (the production deployment `f48c837` predates it).
- **Data:** Content is backfill-only and reversible via the backfill script; `resume.publicity` can be returned to `private` (fail-closed default).

## Known limitations / follow-ups

- Production media upload/delete from the admin UI is verified at the RLS layer (anon denied, owner policy present) but no media objects are uploaded yet; the interactive upload should be smoke-tested by the owner after this rollout.
- The Vercel env `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY`/`SERVICE_ROLE_KEY` values were confirmed present but are sensitive-protected; they are confirmed to point at a working portfolio project (admin login + CMS data render correctly), which is `qvak-portfolio-dev`.
