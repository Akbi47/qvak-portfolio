#!/usr/bin/env node
/**
 * Backfill CMS content (profile, contact/social, skills) into Supabase from
 * the local typed content, preserving stable IDs and translations.
 *
 * Usage: NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run backfill
 *
 * Requires a running Supabase and service-role key. Idempotent: uses
 * upsert-on-conflict on stable IDs/slugs.
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRole) {
  console.error(
    "Missing env: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY",
  );
  process.exit(1);
}

const client = createClient(url, serviceRole, {
  auth: { persistSession: false },
});

async function upsert(table, rows, onConflict) {
  if (rows.length === 0) return;
  const { error } = await client.from(table).upsert(rows, { onConflict });
  if (error) throw new Error(`${table}: ${error.message}`);
  console.log(`${table}: upserted ${rows.length}`);
}

async function backfillSkills() {
  const { skills } = await import("../src/content/skills.ts");

  for (const skill of skills) {
    await upsert(
      "skills",
      [
        {
          id: skill.id,
          group_key: skill.group,
          icon_key: skill.iconKey ?? null,
          url: null,
          order: skill.order,
          featured: skill.featured ?? false,
        },
      ],
      "id",
    );

    await upsert(
      "skill_translations",
      [
        {
          skill_id: skill.id,
          locale: "en",
          name: skill.name.en,
          category: skill.category?.en ?? null,
        },
        {
          skill_id: skill.id,
          locale: "vi",
          name: skill.name.vi,
          category: skill.category?.vi ?? null,
        },
      ],
      "skill_id,locale",
    );
  }
  console.log("Skills backfilled.");
}

async function backfillProfile() {
  const { portfolioProfile, getPortfolioProfile } = await import(
    "../src/content/profile.ts"
  );

  await upsert(
    "profile",
    [
      {
        slug: "owner",
        name: portfolioProfile.name,
        short_name: portfolioProfile.name.split(" ").pop() ?? null,
        github_url: portfolioProfile.githubUrl,
        linkedin_url: null,
        resume_url: null,
        phone: null,
        email: null,
      },
    ],
    "slug",
  );

  const profileIdRes = await client
    .from("profile")
    .select("id")
    .eq("slug", "owner")
    .maybeSingle();
  const profileId = profileIdRes.data?.id;
  if (!profileId) throw new Error("profile id not found");

  await upsert(
    "profile_translations",
    [
      {
        profile_id: profileId,
        locale: "en",
        role: getPortfolioProfile("en").role,
        intro: getPortfolioProfile("en").about.intro,
        location: null,
      },
      {
        profile_id: profileId,
        locale: "vi",
        role: getPortfolioProfile("vi").role,
        intro: getPortfolioProfile("vi").about.intro,
        location: null,
      },
    ],
    "profile_id,locale",
  );
  console.log("Profile backfilled.");
}

async function backfillContact() {
  const { contactDetails } = await import("../src/content/contact.ts");

  for (const detail of Object.values(contactDetails)) {
    await upsert(
      "social_links",
      [
        {
          id: detail.id,
          label: detail.label.en,
          url: detail.href,
          icon_key: detail.id,
          order: 1,
        },
      ],
      "id",
    );
  }
  console.log("Contact/social backfilled.");
}

async function main() {
  await backfillSkills();
  await backfillProfile();
  await backfillContact();
  console.log("Backfill complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
