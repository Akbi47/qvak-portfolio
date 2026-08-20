-- Issue #52: CMS CRUD for Resume/CV (third and most security-sensitive CRUD slice).
--
-- 1. Convert resume tables to stable text ids (matching local content slugs/ids),
--    following the same pattern as skills/social/projects.
-- 2. Add SECURITY INVOKER atomic RPCs (upsert/delete) for categories and entries,
--    granted to authenticated so admin CRUD runs through the owner RLS path. Each
--    mutation writes the base row + both translation rows in a single transaction.
--    Media editing is out of scope (#21); existing media rows are read for the view.
-- 3. The public read path (repository adapter) filters draft=false entries and
--    respects the global resume.publicity gate (already fail-closed in code).

-- --- Convert resume tables to stable text ids --------------------------------
alter table resume_media_translations drop constraint resume_media_translations_resume_media_id_fkey;
alter table resume_media drop constraint resume_media_resume_entry_id_fkey;
alter table resume_entry_translations drop constraint resume_entry_translations_resume_entry_id_fkey;
alter table resume_entries drop constraint resume_entries_category_id_fkey;
alter table resume_category_translations drop constraint resume_category_translations_resume_category_id_fkey;

alter table resume_category_translations alter column resume_category_id type text;
alter table resume_categories drop constraint resume_categories_pkey;
alter table resume_categories alter column id type text;
alter table resume_categories add primary key (id);

alter table resume_category_translations
  add constraint resume_category_translations_resume_category_id_fkey
  foreign key (resume_category_id) references resume_categories(id) on delete cascade;

alter table resume_entries drop constraint resume_entries_pkey;
alter table resume_entries alter column id type text;
alter table resume_entries alter column category_id type text;
alter table resume_entries add primary key (id);

alter table resume_entry_translations alter column resume_entry_id type text;
alter table resume_media alter column resume_entry_id type text;
alter table resume_media alter column id type text;
alter table resume_media drop constraint resume_media_pkey;
alter table resume_media add primary key (id);
alter table resume_media_translations alter column resume_media_id type text;

alter table resume_entries
  add constraint resume_entries_category_id_fkey
  foreign key (category_id) references resume_categories(id) on delete cascade;
alter table resume_entry_translations
  add constraint resume_entry_translations_resume_entry_id_fkey
  foreign key (resume_entry_id) references resume_entries(id) on delete cascade;
alter table resume_media
  add constraint resume_media_resume_entry_id_fkey
  foreign key (resume_entry_id) references resume_entries(id) on delete cascade;
alter table resume_media_translations
  add constraint resume_media_translations_resume_media_id_fkey
  foreign key (resume_media_id) references resume_media(id) on delete cascade;

-- --- Atomic mutations (SECURITY INVOKER, owner RLS path) ----------------------

-- Categories: stable slug, order, EN/VI name.
create or replace function public.cms_upsert_resume_category(
  p_id text,
  p_order integer,
  p_name_en text,
  p_name_vi text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into public.resume_categories (id, slug, "order")
  values (p_id, p_id, p_order)
  on conflict (id) do update set
    slug = excluded.slug,
    "order" = excluded."order";

  insert into public.resume_category_translations (resume_category_id, locale, name)
  values
    (p_id, 'en', p_name_en),
    (p_id, 'vi', p_name_vi)
  on conflict (resume_category_id, locale) do update set
    name = excluded.name;
end;
$$;

create or replace function public.cms_delete_resume_category(p_id text)
returns void
language sql
security invoker
set search_path = ''
as $$
  delete from public.resume_categories where id = p_id;
$$;

-- Entries: base fields + draft + EN/VI translations.
create or replace function public.cms_upsert_resume_entry(
  p_id text,
  p_category_id text,
  p_start_date text,
  p_end_date text,
  p_order integer,
  p_draft boolean,
  p_title_en text,
  p_title_vi text,
  p_organization_en text,
  p_organization_vi text,
  p_location_en text,
  p_location_vi text,
  p_date_label_en text,
  p_date_label_vi text,
  p_summary_en text,
  p_summary_vi text,
  p_highlights_en jsonb,
  p_highlights_vi jsonb,
  p_tags_en jsonb,
  p_tags_vi jsonb
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into public.resume_entries (id, category_id, start_date, end_date, "order", draft, updated_at)
  values (p_id, p_category_id, p_start_date, p_end_date, p_order, p_draft, now())
  on conflict (id) do update set
    category_id = excluded.category_id,
    start_date = excluded.start_date,
    end_date = excluded.end_date,
    "order" = excluded."order",
    draft = excluded.draft,
    updated_at = now();

  insert into public.resume_entry_translations (resume_entry_id, locale, title, organization, location, date_label, summary, highlights, tags)
  values
    (p_id, 'en', p_title_en, p_organization_en, p_location_en, p_date_label_en, p_summary_en, p_highlights_en, p_tags_en),
    (p_id, 'vi', p_title_vi, p_organization_vi, p_location_vi, p_date_label_vi, p_summary_vi, p_highlights_vi, p_tags_vi)
  on conflict (resume_entry_id, locale) do update set
    title = excluded.title,
    organization = excluded.organization,
    location = excluded.location,
    date_label = excluded.date_label,
    summary = excluded.summary,
    highlights = excluded.highlights,
    tags = excluded.tags;
end;
$$;

create or replace function public.cms_delete_resume_entry(p_id text)
returns void
language sql
security invoker
set search_path = ''
as $$
  delete from public.resume_entries where id = p_id;
$$;

revoke all on function public.cms_upsert_resume_category(text, integer, text, text) from public;
revoke all on function public.cms_delete_resume_category(text) from public;
revoke all on function public.cms_upsert_resume_entry(text, text, text, text, integer, boolean, text, text, text, text, text, text, text, text, text, text, jsonb, jsonb, jsonb, jsonb) from public;
revoke all on function public.cms_delete_resume_entry(text) from public;

grant execute on function public.cms_upsert_resume_category(text, integer, text, text) to authenticated, service_role;
grant execute on function public.cms_delete_resume_category(text) to authenticated, service_role;
grant execute on function public.cms_upsert_resume_entry(text, text, text, text, integer, boolean, text, text, text, text, text, text, text, text, text, text, jsonb, jsonb, jsonb, jsonb) to authenticated, service_role;
grant execute on function public.cms_delete_resume_entry(text) to authenticated, service_role;

-- Seed the two canonical resume categories (stable slugs) so the admin CRUD and
-- the public view both have deterministic category ids.
insert into public.resume_categories (id, slug, "order") values
  ('career-journey', 'career-journey', 1),
  ('education-certifications', 'education-certifications', 2)
on conflict (id) do nothing;