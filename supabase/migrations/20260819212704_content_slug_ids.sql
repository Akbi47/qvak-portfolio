-- Convert content entity primary keys from uuid to stable text slugs, matching
-- the local content's stable string IDs (e.g. skills use 'typescript'). This
-- preserves stable IDs across the CMS and makes backfill/repository mapping
-- direct. Applied per-entity as each CRUD slice lands.

-- Skills
alter table skill_translations drop constraint skill_translations_skill_id_fkey;
alter table skills alter column id type text;
alter table skills drop constraint skills_pkey;
alter table skills add primary key (id);
alter table skill_translations alter column skill_id type text;
alter table skill_translations
  add constraint skill_translations_skill_id_fkey
  foreign key (skill_id) references skills(id) on delete cascade;

-- Social links (contact details use stable string ids, e.g. 'github')
alter table social_links drop constraint social_links_pkey;
alter table social_links alter column id type text;
alter table social_links add primary key (id);
