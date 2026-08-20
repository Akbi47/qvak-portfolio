-- Issue #21: CMS media management — Supabase Storage setup.
--
-- Creates the storage buckets defined in the accepted #18 design:
--   - private 'resume-media'  -> served ONLY through the gated /api/resume-media route
--   - public  'project-media' -> optimized public project images
--   - public  'portfolio'     -> profile/social images
--
-- Object-level access follows the owner-only authorization model:
--   - All buckets: only the owner (authenticated, private.is_owner()) may
--     INSERT/UPDATE/DELETE objects.
--   - 'resume-media': SELECT is restricted to owner only (private, deny-by-default);
--     it is NEVER exposed as a public URL — it is served through the gated route,
--     which reads with service-role/server privileges.
--   - 'project-media' / 'portfolio': public SELECT (unauthenticated reads are
--     required for public images), but writes remain owner-only.
--
-- These policies use private.is_owner() (non-recursive SECURITY DEFINER helper),
-- the same authorization used by the content-table RLS.

-- --- Buckets -------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('resume-media',  'resume-media',  false, 10485760, array['image/jpeg','image/png','image/webp']),
  ('project-media', 'project-media', true,  10485760, array['image/jpeg','image/png','image/webp']),
  ('portfolio',     'portfolio',     true,  10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

-- --- Owner-write on all buckets ------------------------------------------------
create policy "owner all objects" on storage.objects
  for all to authenticated
  using (bucket_id in ('resume-media','project-media','portfolio') and private.is_owner())
  with check (bucket_id in ('resume-media','project-media','portfolio') and private.is_owner());

-- --- Public read on the public buckets only ------------------------------------
create policy "public read project-media" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'project-media');

create policy "public read portfolio" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'portfolio');

-- 'resume-media' intentionally has NO public/authenticated SELECT policy, so it is
-- deny-by-default for everyone except the owner (via the owner-all policy). Public
-- serving of resume media happens only through the gated route using the
-- service-role/server path.
