-- Issue #51 review follow-up (request-changes):
-- Preserve the public presentation fields that the local ProjectView carries but
-- the initial projects CRUD schema omitted:
--   1. project_media.focal_point (text) — local media carry meaningful focal points
--      that the carousel renders via objectPosition; hard-coding "50% 50%" degrades
--      cropping after CMS cutover.
--   2. project_translations.highlights (jsonb) — the local ProjectView exposes
--      optional highlight bullets; without a column they are dropped after cutover.
--   3. Query-boundary publication filter: the public repository filters
--      featured && published && status='active' in the PostgREST query (accepted
--      #18 design), not only in application code.
--   4. Zero-media safety: a featured+published project with no media is
--      non-renderable (the carousel has no zero-media state). The repository
--      adapter filters such projects out of the public result (media editing is #21).

alter table project_media add column if not exists focal_point text;
alter table project_translations add column if not exists highlights jsonb;

-- Redefine the projects upsert to carry highlights (EN/VI) so admin edits do not
-- wipe the preserved highlight bullets. Media (and focal_point) are left untouched
-- by this slice; they are managed in #21.
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
  p_description_vi text,
  p_highlights_en jsonb,
  p_highlights_vi jsonb
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

  insert into public.project_translations (project_id, locale, title, category, summary, description, highlights)
  values
    (p_id, 'en', p_title_en, p_category_en, p_summary_en, p_description_en, p_highlights_en),
    (p_id, 'vi', p_title_vi, p_category_vi, p_summary_vi, p_description_vi, p_highlights_vi)
  on conflict (project_id, locale) do update set
    title = excluded.title,
    category = excluded.category,
    summary = excluded.summary,
    description = excluded.description,
    highlights = excluded.highlights;
end;
$$;

revoke all on function public.cms_upsert_project(text, text, jsonb, text, text, boolean, integer, text, boolean, text, text, text, text, text, text, text, text, jsonb, jsonb) from public;
grant execute on function public.cms_upsert_project(text, text, jsonb, text, text, boolean, integer, text, boolean, text, text, text, text, text, text, text, text, jsonb, jsonb) to authenticated, service_role;