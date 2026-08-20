-- Issue #51: CMS CRUD for Projects (second CRUD slice).
--
-- 1. Convert projects (and its media/translation children) to stable text ids,
--    matching the local content's stable string ids (e.g. 'atm-seeking'). This
--    preserves stable IDs across the CMS and makes backfill/repository mapping
--    direct, following the same pattern used for skills and social_links.
-- 2. Add SECURITY INVOKER atomic RPCs (create/update + delete) granted to
--    authenticated so admin CRUD runs through the owner RLS path. Each mutation
--    writes the base row and both translation rows in a single transaction.
--    Media editing is out of scope for #51 (Issue #21), so the RPCs leave media
--    untouched; the public read path still maps existing media rows.
-- 3. Deterministic ordering is handled in the admin query layer (order by
--    order/id) and the public view derivation (filter featured, sort order/id).

-- --- Convert projects to stable text ids -------------------------------------
alter table project_media_translations drop constraint project_media_translations_project_media_id_fkey;
alter table project_media drop constraint project_media_project_id_fkey;
alter table project_translations drop constraint project_translations_project_id_fkey;

alter table project_translations alter column project_id type text;
alter table project_media alter column project_id type text;
alter table project_media alter column id type text;
alter table project_media drop constraint project_media_pkey;
alter table project_media add primary key (id);
alter table project_media_translations alter column project_media_id type text;

alter table projects drop constraint projects_pkey;
alter table projects alter column id type text;
alter table projects add primary key (id);

alter table project_translations
  add constraint project_translations_project_id_fkey
  foreign key (project_id) references projects(id) on delete cascade;
alter table project_media
  add constraint project_media_project_id_fkey
  foreign key (project_id) references projects(id) on delete cascade;
alter table project_media_translations
  add constraint project_media_translations_project_media_id_fkey
  foreign key (project_media_id) references project_media(id) on delete cascade;

-- --- Atomic mutations (SECURITY INVOKER, owner RLS path) ----------------------
create or replace function public.cms_upsert_project(
  p_id text,
  p_slug text,
  p_tech_stack jsonb,
  p_live_demo_url text,
  p_code_url text,
  p_featured boolean,
  p_order integer,
  p_status text,
  p_published boolean,
  p_title_en text,
  p_title_vi text,
  p_category_en text,
  p_category_vi text,
  p_summary_en text,
  p_summary_vi text,
  p_description_en text,
  p_description_vi text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into public.projects (id, slug, tech_stack, live_demo_url, code_url, featured, "order", status, published, updated_at)
  values (p_id, p_slug, p_tech_stack, p_live_demo_url, p_code_url, p_featured, p_order, p_status, p_published, now())
  on conflict (id) do update set
    slug = excluded.slug,
    tech_stack = excluded.tech_stack,
    live_demo_url = excluded.live_demo_url,
    code_url = excluded.code_url,
    featured = excluded.featured,
    "order" = excluded."order",
    status = excluded.status,
    published = excluded.published,
    updated_at = now();

  insert into public.project_translations (project_id, locale, title, category, summary, description)
  values
    (p_id, 'en', p_title_en, p_category_en, p_summary_en, p_description_en),
    (p_id, 'vi', p_title_vi, p_category_vi, p_summary_vi, p_description_vi)
  on conflict (project_id, locale) do update set
    title = excluded.title,
    category = excluded.category,
    summary = excluded.summary,
    description = excluded.description;
end;
$$;

create or replace function public.cms_delete_project(p_id text)
returns void
language sql
security invoker
set search_path = ''
as $$
  delete from public.projects where id = p_id;
$$;

revoke all on function public.cms_upsert_project(text, text, jsonb, text, text, boolean, integer, text, boolean, text, text, text, text, text, text, text, text) from public;
revoke all on function public.cms_delete_project(text) from public;

grant execute on function public.cms_upsert_project(text, text, jsonb, text, text, boolean, integer, text, boolean, text, text, text, text, text, text, text, text) to authenticated, service_role;
grant execute on function public.cms_delete_project(text) to authenticated, service_role;