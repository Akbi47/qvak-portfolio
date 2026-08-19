-- Idempotent seed data (runs after migrations on `supabase db reset`).
-- app_settings defaults are already created in the cms_schema migration; this
-- keeps the seed self-contained for fresh resets.

insert into app_settings (key, value)
values ('resume.publicity', '"private"')
on conflict (key) do nothing;
