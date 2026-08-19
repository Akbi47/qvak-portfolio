# 2026-08-20 — Supabase Portfolio CMS Schema and Permissions

Status: Accepted (owner-approved design for Issue #18)

This document is the common design authority for all CMS slices (#19, #20, #21, #51, #52). It specifies the translation-aware schema, runtime settings, the two-gate resume privacy model, media strategy, authentication/authorization, the repository adapter contract, and the migration/backfill path.

## Principles

- Stable-ID base tables plus locale translation tables (no locale-column-per-document). Adding a locale must not duplicate whole documents.
- The public UI never queries Supabase rows directly; it consumes the existing normalized typed view models through a repository contract.
- Deny-by-default security: single owner, RLS on every table, service-role key server-only.
- Any read/config/cache failure for resume publicity fails closed to **private**.
- Local typed content remains the default repository implementation; the Supabase adapter satisfies the same contract.

## Schema

### Profile

```sql
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
```

### Social links

```sql
create table social_links (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  url text not null,
  icon_key text not null,
  order integer not null default 0
);
```

### Skills

```sql
create table skills (
  id uuid primary key default gen_random_uuid(),
  group_key text not null check (group_key in ('tech-stack','others')),
  icon_key text,
  url text,
  order integer not null default 0,
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
```

### Projects

```sql
create table projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  tech_stack jsonb not null default '[]',
  live_demo_url text,
  code_url text,
  featured boolean not null default false,
  order integer not null default 0,
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
  order integer not null default 0
);

create table project_media_translations (
  id uuid primary key default gen_random_uuid(),
  project_media_id uuid not null references project_media(id) on delete cascade,
  locale text not null check (locale in ('en','vi')),
  alt text not null,
  unique (project_media_id, locale)
);
```

### Resume

```sql
create table resume_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  order integer not null default 0
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
  order integer not null default 0,
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
  order integer not null default 0
);

create table resume_media_translations (
  id uuid primary key default gen_random_uuid(),
  resume_media_id uuid not null references resume_media(id) on delete cascade,
  locale text not null check (locale in ('en','vi')),
  alt text not null,
  caption text,
  unique (resume_media_id, locale)
);
```

## Runtime settings and two-gate resume privacy

```sql
create table app_settings (
  key text primary key,
  value jsonb not null,
  changed_at timestamptz not null default now(),
  changed_by text
);
```

- Single authoritative source for runtime flags, e.g. `resume.publicity = 'private' | 'visible'`.
- **Two-gate model**: a resume entry is publicly rendered only when:
  1. `resume_entries.draft = false` (per-entity published), **AND**
  2. `app_settings('resume.publicity') = 'visible'` (global section visibility).
- Both the public page and the gated `/api/resume-media/*` route read the SAME value from `app_settings`.
- **Fail closed**: any read/config/cache failure or missing row resolves to `private` (never visible).

## Media strategy

- **Private bucket** `resume-media`: resume thumbnails/full images served ONLY through the gated server route `/api/resume-media/*`. Never exposed as public static Storage URLs.
- **Public bucket** `project-media` (and `portfolio` for profile/social images): served through server-authorized/optimized routes.
- Media URLs stored as references; client components never receive raw public bucket URLs except through the server/optimization layer.

## Authentication and authorization (single owner, deny-by-default)

- One Supabase Auth user (email/password) as the sole admin owner. No public registration.
- RLS enabled on **every** table, deny-by-default; only the owner role may select/insert/update/delete.
- Service-role key is server-only and never reaches the browser.
- Admin state changes (e.g. toggling resume publicity) record `changed_at` / `changed_by` and require explicit confirmation before Visible.

### RLS template (applied to every table)

```sql
alter table <table> enable row level security;

create policy "owner select" on <table> for select to authenticated
  using (auth.uid() = (select id from admin_owner));

create policy "owner insert" on <table> for insert to authenticated
  with check (auth.uid() = (select id from admin_owner));

create policy "owner update" on <table> for update to authenticated
  using (auth.uid() = (select id from admin_owner));

create policy "owner delete" on <table> for delete to authenticated
  using (auth.uid() = (select id from admin_owner));
```

An `admin_owner` table (single row) holds the owner auth id; RLS references it so ownership is centralized and deny-by-default holds.

## Repository adapter contract

The public UI never queries Supabase directly. It consumes the existing normalized typed view models via a repository interface (per `docs/04-technical-architecture.md`):

```ts
interface PortfolioRepository {
  getProfile(locale: Locale): Promise<PortfolioProfileView>;
  getSkills(locale: Locale): Promise<SkillView[]>;
  getFeaturedProjects(locale: Locale): Promise<FeaturedProjectsView>;
  getResume(locale: Locale): Promise<ResumeContentView>;
}
```

- The local typed content (`src/content/*.ts`) is the default implementation.
- The Supabase adapter maps DB rows → the same view models behind the same contract.
- Canonical/SEO URLs remain config-driven (`productionSiteUrl`); `NEXT_PUBLIC_SITE_URL` unaffected.

## Migration and backfill

1. **SQL migration** creates the tables, `app_settings`, `admin_owner`, enables RLS, and installs owner policies.
2. **Backfill script** reads local `src/content/*.ts` and inserts into Supabase, preserving stable IDs and translations (seed `resume.publicity` to `private`).
3. Migration/backfill are committed to the repo as version-controlled SQL + script; credentials never committed.

## Acceptance mapping

- Schema preserves stable IDs and translations without duplicating documents → base + translation tables.
- Runtime settings + two-gate resume privacy explicitly specified → `app_settings` + `draft`/`publicity` model.
- RLS/admin permissions explicit, single owner, deny-by-default → RLS template + `admin_owner`.
- Media ownership/access explicit → private/public bucket strategy + gated route.
- Local repository view models remain the UI contract → `PortfolioRepository` adapter.
- Migration/backfill plan exists → SQL migration + backfill script.

## Open for #19+ implementation

- Admin route/shell and auth flow are scoped to #19, not specified here.
- CRUD screens (#20/#51/#52) and media management workflow (#21) build on this schema.
