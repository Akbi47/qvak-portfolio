import { getServerClient } from "@/features/cms/session";
import type { SkillGroup } from "@/content/skills";

export interface AdminSkillRow {
  id: string;
  group: SkillGroup;
  iconKey: string | null;
  url: string | null;
  order: number;
  featured: boolean;
  nameEn: string;
  nameVi: string;
  categoryEn: string | null;
  categoryVi: string | null;
}

export async function listSkills(): Promise<AdminSkillRow[]> {
  const client = await getServerClient();

  const { data, error } = await client
    .from("skills")
    .select("id, group_key, icon_key, url, order, featured, skill_translations(locale, name, category)")
    .order("group_key")
    .order("order")
    .order("id");

  if (error || !data) return [];

  return data.map((skill) => {
    const translations = (skill.skill_translations ?? []) as Array<{
      locale: string;
      name: string;
      category: string | null;
    }>;
    const en = translations.find((t) => t.locale === "en");
    const vi = translations.find((t) => t.locale === "vi");

    return {
      id: skill.id,
      group: skill.group_key as SkillGroup,
      iconKey: skill.icon_key,
      url: skill.url,
      order: skill.order,
      featured: skill.featured,
      nameEn: en?.name ?? "",
      nameVi: vi?.name ?? "",
      categoryEn: en?.category ?? null,
      categoryVi: vi?.category ?? null,
    };
  });
}

export async function getSkill(id: string): Promise<AdminSkillRow | null> {
  const rows = await listSkills();
  return rows.find((row) => row.id === id) ?? null;
}
