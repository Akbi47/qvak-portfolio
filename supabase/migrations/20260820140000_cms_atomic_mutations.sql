-- Issue #20 review follow-up:
-- 1. Reconcile the Profile contract with the schema: the local Profile contract
--    carries stable identity fields (name / shortName) that the schema omitted.
--    Add them to the base profile table so the admin CRUD does not silently drop
--    them from the editable contract. Social links stay locale-neutral by design
--    (no social_translations table is introduced).
-- 2. Atomic base-row + translation-row mutations. The server actions previously
--    issued separate base and translation writes; a failure between them could
--    leave a partial write reported as a failed action. These SECURITY DEFINER
--    functions run each mutation inside a single transaction (PL/pgSQL function
--    bodies are transactional), so a failure rolls back the whole operation.

-- --- Profile reconciliation: stable identity fields -----------------------------
alter table profile add column if not exists name text;
alter table profile add column if not exists short_name text;

-- --- Atomic mutations (schema-qualified, hardened search_path) ------------------
-- These live in the `public` schema so PostgREST exposes them as RPC endpoints for
-- the server-side service-role client. They are SECURITY DEFINER and only
-- executable by service_role (revoked from public/anon/authenticated), so the
-- browser can never invoke them.

create or replace function public.cms_upsert_skill(
  p_id text,
  p_group_key text,
  p_icon_key text,
  p_url text,
  p_order integer,
  p_featured boolean,
  p_name_en text,
  p_name_vi text,
  p_category_en text,
  p_category_vi text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.skills (id, group_key, icon_key, url, "order", featured)
  values (p_id, p_group_key, p_icon_key, p_url, p_order, p_featured)
  on conflict (id) do update set
    group_key = excluded.group_key,
    icon_key = excluded.icon_key,
    url = excluded.url,
    "order" = excluded."order",
    featured = excluded.featured;

  insert into public.skill_translations (skill_id, locale, name, category)
  values
    (p_id, 'en', p_name_en, p_category_en),
    (p_id, 'vi', p_name_vi, p_category_vi)
  on conflict (skill_id, locale) do update set
    name = excluded.name,
    category = excluded.category;
end;
$$;

create or replace function public.cms_delete_skill(p_id text)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.skills where id = p_id;
$$;

create or replace function public.cms_upsert_profile(
  p_id uuid,
  p_name text,
  p_short_name text,
  p_github_url text,
  p_linkedin_url text,
  p_resume_url text,
  p_phone text,
  p_email text,
  p_role_en text,
  p_role_vi text,
  p_intro_en text,
  p_intro_vi text,
  p_location_en text,
  p_location_vi text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profile set
    name = p_name,
    short_name = p_short_name,
    github_url = p_github_url,
    linkedin_url = p_linkedin_url,
    resume_url = p_resume_url,
    phone = p_phone,
    email = p_email,
    updated_at = now()
  where id = p_id;

  insert into public.profile_translations (profile_id, locale, role, intro, location)
  values
    (p_id, 'en', p_role_en, p_intro_en, p_location_en),
    (p_id, 'vi', p_role_vi, p_intro_vi, p_location_vi)
  on conflict (profile_id, locale) do update set
    role = excluded.role,
    intro = excluded.intro,
    location = excluded.location;
end;
$$;

create or replace function public.cms_upsert_social(
  p_id text,
  p_label text,
  p_url text,
  p_icon_key text,
  p_order integer
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.social_links (id, label, url, icon_key, "order")
  values (p_id, p_label, p_url, p_icon_key, p_order)
  on conflict (id) do update set
    label = excluded.label,
    url = excluded.url,
    icon_key = excluded.icon_key,
    "order" = excluded."order";
$$;

create or replace function public.cms_delete_social(p_id text)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.social_links where id = p_id;
$$;

-- Restrict execution to the server-side service-role client only.
revoke all on function public.cms_upsert_skill(text, text, text, text, integer, boolean, text, text, text, text) from public;
revoke all on function public.cms_delete_skill(text) from public;
revoke all on function public.cms_upsert_profile(uuid, text, text, text, text, text, text, text, text, text, text, text, text, text) from public;
revoke all on function public.cms_upsert_social(text, text, text, text, integer) from public;
revoke all on function public.cms_delete_social(text) from public;

grant execute on function public.cms_upsert_skill(text, text, text, text, integer, boolean, text, text, text, text) to service_role;
grant execute on function public.cms_delete_skill(text) to service_role;
grant execute on function public.cms_upsert_profile(uuid, text, text, text, text, text, text, text, text, text, text, text, text, text) to service_role;
grant execute on function public.cms_upsert_social(text, text, text, text, integer) to service_role;
grant execute on function public.cms_delete_social(text) to service_role;