-- RLS verification for Issue #20 (CMS CRUD slices).
--
-- Requirement (review follow-up): authorization/RLS must be verified through
-- authenticated OWNER credentials plus negative anonymous / non-owner cases.
-- Service-role tests do not verify RLS because the service role bypasses it.
--
-- These tests run as the database superuser (pgTAP) and switch the effective
-- role + JWT claims to simulate real clients:
--   - anonymous client      -> role anon, no claims
--   - owner (admin) client  -> role authenticated, claims.sub = owner auth_uid
--   - non-owner client      -> role authenticated, claims.sub = some other uid
--
-- The owner auth_uid is read from the seeded admin_owner row so the test adapts
-- to whichever auth user is the configured single owner.

begin;
select plan(13);

-- Capture the owner uid while still superuser (admin_owner is RLS-filtered for
-- other roles), then set claims session-wide so they survive the role switch.
select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub', (select auth_uid from public.admin_owner limit 1)::text,
    'role', 'authenticated'
  )::text,
  false
);

-- Fixture rows for CRUD assertions (created as superuser, before switching).
insert into public.profile (id, slug, github_url)
  values ('00000000-0000-0000-0000-000000000001', 'rls-test', 'https://github.com/test')
  on conflict (slug) do nothing;

insert into public.social_links (id, label, url, icon_key, "order")
  values ('rls-test', 'Test', 'https://example.com', 'test', 1)
  on conflict (id) do nothing;

insert into public.skills (id, group_key, "order")
  values ('rls-test', 'tech-stack', 1)
  on conflict (id) do nothing;

insert into public.projects (id, slug, tech_stack, featured, "order", status, published)
  values ('rls-test', 'rls-test', '[]', true, 1, 'active', true)
  on conflict (id) do nothing;

insert into public.resume_categories (id, slug, "order")
  values ('rls-test', 'rls-test', 1)
  on conflict (id) do nothing;

insert into public.resume_entries (id, category_id, "order", draft)
  values ('rls-test', 'rls-test', 1, false)
  on conflict (id) do nothing;

-- --- Owner: SELECT succeeds ------------------------------------------------
set local role authenticated;

select is(
  (select count(*) from public.profile where slug = 'rls-test'),
  1::bigint,
  'owner can SELECT profile'
);

select is(
  (select count(*) from public.social_links where id = 'rls-test'),
  1::bigint,
  'owner can SELECT social_links'
);

select is(
  (select count(*) from public.skills where id = 'rls-test'),
  1::bigint,
  'owner can SELECT skills'
);

select is(
  (select count(*) from public.projects where id = 'rls-test'),
  1::bigint,
  'owner can SELECT projects'
);

select is(
  (select count(*) from public.resume_entries where id = 'rls-test'),
  1::bigint,
  'owner can SELECT resume_entries'
);

-- --- Owner: INSERT succeeds -----------------------------------------------
insert into public.skills (id, group_key, "order")
  values ('rls-test-insert', 'tech-stack', 99);
select ok(
  exists (select 1 from public.skills where id = 'rls-test-insert'),
  'owner can INSERT into skills'
);

-- --- Owner: UPDATE succeeds -----------------------------------------------
update public.skills set "order" = 100 where id = 'rls-test-insert';
select is(
  (select "order" from public.skills where id = 'rls-test-insert'),
  100,
  'owner can UPDATE skills'
);

-- --- Owner: DELETE succeeds -----------------------------------------------
delete from public.skills where id = 'rls-test-insert';
select ok(
  not exists (select 1 from public.skills where id = 'rls-test-insert'),
  'owner can DELETE skills'
);

-- --- Anonymous: denied (zero privileges, deny-by-default) -------------------
reset role;
set local role anon;
select set_config('request.jwt.claims', '{}', true);

select throws_ok(
  $$ select * from public.skills $$,
  null,
  'permission denied for table skills',
  'anonymous cannot SELECT skills'
);

-- --- Non-owner authenticated: denied by RLS (owner-only policy) -------------
reset role;
set local role authenticated;
select set_config(
  'request.jwt.claims',
  json_build_object('sub', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'role', 'authenticated')::text,
  true
);

select is(
  (select count(*) from public.profile),
  0::bigint,
  'non-owner sees zero profile rows (RLS filters)'
);

select throws_ok(
  $$ insert into public.skills (id, group_key) values ('intruder', 'tech-stack') $$,
  null,
  null,
  'non-owner cannot INSERT into skills (RLS with-check)'
);

select is(
  (select count(*) from public.projects),
  0::bigint,
  'non-owner sees zero projects rows (RLS filters)'
);

select is(
  (select count(*) from public.resume_entries),
  0::bigint,
  'non-owner sees zero resume_entries rows (RLS filters)'
);

-- --- Cleanup fixtures ------------------------------------------------
reset role;
delete from public.social_links where id = 'rls-test';
delete from public.skills where id = 'rls-test';
delete from public.projects where id = 'rls-test';
delete from public.resume_entries where id = 'rls-test';
delete from public.resume_categories where id = 'rls-test';
delete from public.profile where id = '00000000-0000-0000-0000-000000000001';

select * from finish();
rollback;