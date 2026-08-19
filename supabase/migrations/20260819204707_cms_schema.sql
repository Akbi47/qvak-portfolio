-- Issue #18 CMS schema: portfolio content tables, runtime settings, single-owner auth.

-- Content tables (base + translations). See docs/superpowers/specs/2026-08-20-supabase-cms-schema-design.md.

create table profile (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  github_url text not null,
  linkedin_url text,
  resume_url text,
  phone text,
  email text,
  updated_at timestamptz not null default now()
);

create table profile_translations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profile(id) on delete cascade,
  locale text not null check (locale in ('en','vi')),
  role text not null,
  intro text not null,
  location text,
  unique (profile_id, locale)
);

create table social_links (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  url text not null,
  icon_key text not null,
  "order" integer not null default 0
);

create table skills (
  id uuid primary key default gen_random_uuid(),
  group_key text not null check (group_key in ('tech-stack','others')),
  icon_key text,
  url text,
  "order" integer not null default 0,
  featured boolean not null default false
);

create table skill_translations (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid not null references skills(id) on delete cascade,
  locale text not null check (locale in ('en','vi')),
  name text not null,
  category text,
  unique (skill_id, locale)
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  tech_stack jsonb not null default '[]',
  live_demo_url text,
  code_url text,
  featured boolean not null default false,
  "order" integer not null default 0,
  status text not null default 'active' check (status in ('active','archived','private')),
  published boolean not null default false,
  updated_at timestamptz not null default now()
);

create table project_translations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  locale text not null check (locale in ('en','vi')),
  title text not null,
  category text not null,
  summary text not null,
  description text,
  unique (project_id, locale)
);

create table project_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  src text not null,
  kind text not null default 'image',
  width integer,
  height integer,
  "order" integer not null default 0
);

create table project_media_translations (
  id uuid primary key default gen_random_uuid(),
  project_media_id uuid not null references project_media(id) on delete cascade,
  locale text not null check (locale in ('en','vi')),
  alt text not null,
  unique (project_media_id, locale)
);

create table resume_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  "order" integer not null default 0
);

create table resume_category_translations (
  id uuid primary key default gen_random_uuid(),
  resume_category_id uuid not null references resume_categories(id) on delete cascade,
  locale text not null check (locale in ('en','vi')),
  name text not null,
  unique (resume_category_id, locale)
);

create table resume_entries (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references resume_categories(id) on delete cascade,
  start_date text,
  end_date text,
  "order" integer not null default 0,
  draft boolean not null default true,
  updated_at timestamptz not null default now()
);

create table resume_entry_translations (
  id uuid primary key default gen_random_uuid(),
  resume_entry_id uuid not null references resume_entries(id) on delete cascade,
  locale text not null check (locale in ('en','vi')),
  title text not null,
  organization text,
  location text,
  date_label text,
  summary text,
  highlights jsonb not null default '[]',
  tags jsonb not null default '[]',
  unique (resume_entry_id, locale)
);

create table resume_media (
  id uuid primary key default gen_random_uuid(),
  resume_entry_id uuid not null references resume_entries(id) on delete cascade,
  thumbnail_src text not null,
  full_src text not null,
  width integer,
  height integer,
  "order" integer not null default 0
);

create table resume_media_translations (
  id uuid primary key default gen_random_uuid(),
  resume_media_id uuid not null references resume_media(id) on delete cascade,
  locale text not null check (locale in ('en','vi')),
  alt text not null,
  caption text,
  unique (resume_media_id, locale)
);

-- Runtime settings (single authoritative source for runtime flags).
create table app_settings (
  key text primary key,
  value jsonb not null,
  changed_at timestamptz not null default now(),
  changed_by text
);

-- Seed resume publicity to private (fail-closed default; no redeploy workflow).
insert into app_settings (key, value)
values ('resume.publicity', '"private"')
on conflict (key) do nothing;

-- Single-owner authorization. Invariant: exactly one row, enforced at the DB
-- level by the partial unique index below (see admin_owner_single_row).
create table admin_owner (
  id uuid primary key default gen_random_uuid(),
  auth_uid uuid not null unique,
  created_at timestamptz not null default now()
);
-- Single-owner invariant: enforce exactly one row at the DB level (concurrency-safe).
create unique index admin_owner_single_row on admin_owner ((true));

-- SECURITY DEFINER helpers in a private (non-exposed) schema.
-- Hardened search_path + schema-qualified relations (avoids RLS recursion and
-- wrong-schema resolution).
create schema private;

create or replace function private.is_owner()
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_owner where auth_uid = auth.uid()
  );
$$;

revoke all on function private.is_owner() from public;
grant execute on function private.is_owner() to authenticated;

-- Narrow server-side read of app_settings, fail-closed at the caller.
create or replace function private.get_app_setting(p_key text)
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select value from public.app_settings where key = p_key;
$$;

revoke all on function private.get_app_setting(text) from public;
grant execute on function private.get_app_setting(text) to service_role;

-- Grants: anon gets zero privileges; authenticated admin gets table operations,
-- with RLS restricting which rows. app_settings is not directly readable by
-- anon (public reads go through the SECURITY DEFINER RPC / server path).
revoke all on profile, profile_translations, social_links, skills,
  skill_translations, projects, project_translations, project_media,
  project_media_translations, resume_categories, resume_category_translations,
  resume_entries, resume_entry_translations, resume_media,
  resume_media_translations, app_settings from anon;

grant select, insert, update, delete on profile, profile_translations,
  social_links, skills, skill_translations, projects, project_translations,
  project_media, project_media_translations, resume_categories,
  resume_category_translations, resume_entries, resume_entry_translations,
  resume_media, resume_media_translations, app_settings to authenticated;

-- The Next.js server reads AND writes app_settings (resume publicity) via the
-- service-role path, so grant it the needed privileges on this table only
-- (not the content tables).
grant select, insert, update on app_settings to service_role;

-- RLS enabled on every content table (deny-by-default).
alter table profile enable row level security;
alter table profile_translations enable row level security;
alter table social_links enable row level security;
alter table skills enable row level security;
alter table skill_translations enable row level security;
alter table projects enable row level security;
alter table project_translations enable row level security;
alter table project_media enable row level security;
alter table project_media_translations enable row level security;
alter table resume_categories enable row level security;
alter table resume_category_translations enable row level security;
alter table resume_entries enable row level security;
alter table resume_entry_translations enable row level security;
alter table resume_media enable row level security;
alter table resume_media_translations enable row level security;
alter table app_settings enable row level security;

-- Owner policies via private.is_owner() (non-recursive, single owner).
create policy "owner all" on profile for all to authenticated
  using (private.is_owner()) with check (private.is_owner());
create policy "owner all" on profile_translations for all to authenticated
  using (private.is_owner()) with check (private.is_owner());
create policy "owner all" on social_links for all to authenticated
  using (private.is_owner()) with check (private.is_owner());
create policy "owner all" on skills for all to authenticated
  using (private.is_owner()) with check (private.is_owner());
create policy "owner all" on skill_translations for all to authenticated
  using (private.is_owner()) with check (private.is_owner());
create policy "owner all" on projects for all to authenticated
  using (private.is_owner()) with check (private.is_owner());
create policy "owner all" on project_translations for all to authenticated
  using (private.is_owner()) with check (private.is_owner());
create policy "owner all" on project_media for all to authenticated
  using (private.is_owner()) with check (private.is_owner());
create policy "owner all" on project_media_translations for all to authenticated
  using (private.is_owner()) with check (private.is_owner());
create policy "owner all" on resume_categories for all to authenticated
  using (private.is_owner()) with check (private.is_owner());
create policy "owner all" on resume_category_translations for all to authenticated
  using (private.is_owner()) with check (private.is_owner());
create policy "owner all" on resume_entries for all to authenticated
  using (private.is_owner()) with check (private.is_owner());
create policy "owner all" on resume_entry_translations for all to authenticated
  using (private.is_owner()) with check (private.is_owner());
create policy "owner all" on resume_media for all to authenticated
  using (private.is_owner()) with check (private.is_owner());
create policy "owner all" on resume_media_translations for all to authenticated
  using (private.is_owner()) with check (private.is_owner());
create policy "owner all" on app_settings for all to authenticated
  using (private.is_owner()) with check (private.is_owner());

-- admin_owner is touched only by its own writer / server, not the owner template.
alter table admin_owner enable row level security;
create policy "owner self" on admin_owner for select to authenticated
  using (auth_uid = (select auth.uid()));

-- The owner reads their own admin_owner row during server-side authorization.
grant select on admin_owner to authenticated;

-- The seed/ops script (service-role, server-only) maintains the single owner row.
grant select, insert, update, delete on admin_owner to service_role;
