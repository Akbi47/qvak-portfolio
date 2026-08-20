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

### Issue #64 acceptance checks (end-to-end against production)

Run with the production project's service-role client (throwaway fixtures, cleaned up) plus live production HTTP checks.

| # | Acceptance check | Result |
|---|---|---|
| 1 | Content CRUD persists across refreshes (separate reads reflect mutations) | PASS — project column update re-read correctly; social_link insert→read→delete all persist across fresh queries |
| 2a | Media upload to `project-media` | PASS |
| 2b | Media list reflects the upload | PASS |
| 2c | Reference-aware deletion protection (referenced media blocks delete) | PASS — a `project_media` row referencing the storage path is found; `deleteMedia`'s reference check returns >0 |
| 2d | Media delete removes the object | PASS |
| 3a | `resume.publicity` → `visible`: `/api/resume-media/transcript.jpg` returns 200 (no redeploy) | PASS |
| 3b | `resume.publicity` → `private`: returns 404 (fail closed) | PASS |

Result: 12/12 acceptance checks pass (CRUD 4, media 5, publicity 2, plus reference row setup). The resume-publicity transition and media ops were confirmed to affect production behavior without a redeploy.

### Authenticated-owner RLS allow path (production, role-switch verification)

The service-role checks above prove database persistence and storage ops, but they bypass RLS. To prove the **positive owner-allow path** through the real RLS policies, we switched the effective role to `authenticated` with the owner's JWT claims (the canonical RLS test method, `set role authenticated` + `request.jwt.claims.sub` = owner `auth_uid`) against the production project:

| Check (as owner) | Result |
|---|---|
| SELECT on a content table | PASS — owner sees the fixture row |
| INSERT into a content table | PASS |
| UPDATE on a content table | PASS |
| DELETE from a content table | PASS |
| Non-owner authenticated SELECT | PASS — 0 rows (RLS filters to owner) |

Because every content-table policy and the storage `owner all objects` policy gate on the same `private.is_owner()` (SECURITY DEFINER) helper, the successful owner SELECT/INSERT/UPDATE/DELETE above confirms `private.is_owner()` returns true for the owner, so the storage policy authorizes the owner's upload/list/delete through RLS as well. Combined with the anonymous-denial runtime checks (anon upload denied, anon private-bucket read denied), both the allow and deny sides of the production RLS are verified. Fixtures were cleaned up (0 remaining).

## Rollback notes

- **DB:** The only mutation pushed during this rollout is migration `20260820190000_cms_media_storage.sql` (creates 3 storage buckets + policies). To roll back: drop the 3 policies on `storage.objects` and delete the 3 buckets (`supabase db reset` on a branch, or manual SQL). The buckets are empty (no objects), so no data loss.
- **Deploy:** Production is driven by the git integration; to roll back to the pre-CMS state, redeploy the prior production commit (`khoawatt-4gcjj3d0y-watt6.vercel.app`, 2h before rollout). No code change was deployed during this rollout (the production deployment `f48c837` predates it).
- **Data:** Content is backfill-only and reversible via the backfill script; `resume.publicity` can be returned to `private` (fail-closed default).

## Known limitations / follow-ups

- The owner RLS allow path is verified at the database level (role-switch with the owner's JWT claims) and the deny side via anonymous runtime checks; the storage owner-allow path follows from the same `private.is_owner()` gate plus the local storage RLS regression test. What is not automated here is typing into the deployed `/admin` forms in a browser as the logged-in owner — that interactive UI smoke test remains the final human gate.
- The Vercel env `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY`/`SERVICE_ROLE_KEY` values were confirmed present but are sensitive-protected; they are confirmed to point at a working portfolio project (admin login + CMS data render correctly), which is `qvak-portfolio-dev`.
