import type { Locale } from "@/features/i18n/config";
import {
  getPortfolioProfile as getLocalProfile,
  type PortfolioProfileView,
} from "@/content/profile";
import {
  getSkillsContent as getLocalSkills,
  type SkillGroup,
  type SkillIconKey,
  type SkillsContentView,
} from "@/content/skills";
import {
  getContactContent as getLocalContact,
  type ContactContentView,
} from "@/content/contact";
import { getServiceClient } from "./server";
import { hasCmsConfig } from "./config";

/**
 * Repository boundary for the public read path (Issue #20 / #18).
 *
 * The public, unauthenticated SSR page reads CMS-managed content through this
 * adapter. Per the accepted #18 design, the public runtime read path uses the
 * narrow server-only service-role client (anon has zero privileges and RLS
 * would deny it). This is intentionally separate from the authenticated-owner
 * CRUD path used by the admin dashboard.
 *
 * Each accessor returns the existing typed view model: CMS data overrides the
 * CMS-managed fields, and the static copy (hero/contact/skills copy, form
 * labels, images) falls back to the local typed content when the CMS is not
 * configured or a record is missing. The public UI never sees raw Supabase rows.
 */

interface ProfileRow {
  name: string | null;
  github_url: string | null;
  profile_translations: Array<{
    locale: string;
    role: string;
    intro: string;
  }>;
}

interface SkillTranslation {
  locale: string;
  name: string;
  category: string | null;
}

interface SkillRow {
  id: string;
  group_key: SkillGroup;
  icon_key: SkillIconKey | null;
  url: string | null;
  order: number;
  skill_translations: SkillTranslation[];
}

interface SocialRow {
  id: string;
  label: string;
  url: string;
  icon_key: string | null;
  order: number;
}

export async function getPortfolioProfile(
  locale: Locale,
): Promise<PortfolioProfileView> {
  const base = getLocalProfile(locale);

  if (!hasCmsConfig()) {
    return base;
  }

  const client = getServiceClient();
  if (!client) return base;

  try {
    const { data, error } = await client
      .from("profile")
      .select(
        "name, github_url, profile_translations(locale, role, intro)",
      )
      .maybeSingle();

    if (error || !data) return base;

    const row = data as ProfileRow;
    const en = row.profile_translations.find((t) => t.locale === "en");
    const vi = row.profile_translations.find((t) => t.locale === "vi");
    const active = locale === "vi" ? vi : en;

    return {
      ...base,
      name: row.name || base.name,
      role: active?.role || base.role,
      githubUrl: row.github_url || base.githubUrl,
      about: {
        ...base.about,
        intro: active?.intro || base.about.intro,
      },
    };
  } catch {
    return base;
  }
}

export async function getSkillsContent(
  locale: Locale,
): Promise<SkillsContentView> {
  const base = getLocalSkills(locale);

  if (!hasCmsConfig()) {
    return base;
  }

  const client = getServiceClient();
  if (!client) return base;

  try {
    const { data, error } = await client
      .from("skills")
      .select(
        "id, group_key, icon_key, url, order, skill_translations(locale, name, category)",
      )
      .order("group_key")
      .order("order")
      .order("id");

    if (error || !data) return base;

    const rows = data as SkillRow[];

    const techStack = rows
      .filter((r) => r.group_key === "tech-stack")
      .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id))
      .map((r) => ({
        id: r.id,
        name: pickTranslation(r.skill_translations, "name", locale),
        iconKey: r.icon_key ?? undefined,
      }));

    const otherRows = rows
      .filter((r) => r.group_key === "others")
      .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));

    const categories = new Map<
      string,
      { id: string; name: string; skills: Array<{ id: string; name: string; iconKey?: SkillIconKey }> }
    >();

    for (const row of otherRows) {
      const categoryEn =
        row.skill_translations.find((t) => t.locale === "en")?.category ?? null;
      const categoryName =
        row.skill_translations.find((t) => t.locale === locale)?.category ??
        categoryEn;

      if (!categoryName) continue;

      const existing = categories.get(categoryName);
      const skill = {
        id: row.id,
        name: pickTranslation(row.skill_translations, "name", locale),
        iconKey: row.icon_key ?? undefined,
      };

      if (existing) {
        existing.skills.push(skill);
      } else {
        categories.set(categoryName, {
          id: categoryEn?.toLowerCase().replaceAll(" ", "-") ?? row.id,
          name: categoryName,
          skills: [skill],
        });
      }
    }

    return {
      ...base,
      techStack,
      otherCategories: [...categories.values()],
    };
  } catch {
    return base;
  }
}

export async function getContactContent(
  locale: Locale,
): Promise<ContactContentView> {
  const base = getLocalContact(locale);

  if (!hasCmsConfig()) {
    return base;
  }

  const client = getServiceClient();
  if (!client) return base;

  try {
    const { data, error } = await client
      .from("social_links")
      .select("id, label, url, icon_key, order")
      .order("order")
      .order("id");

    if (error || !data) return base;

    const rows = data as SocialRow[];

    return {
      ...base,
      details: rows.map((row) => ({
        id: row.id,
        label: row.label,
        value: row.label,
        href: row.url,
      })),
    };
  } catch {
    return base;
  }
}

function pickTranslation(
  translations: SkillTranslation[],
  key: "name" | "category",
  locale: Locale,
): string {
  const en = translations.find((t) => t.locale === "en");
  const active = translations.find((t) => t.locale === locale);
  return active?.[key] ?? en?.[key] ?? "";
}