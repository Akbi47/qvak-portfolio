"use server";

import { revalidatePath } from "next/cache";

import { getServiceClient } from "@/features/cms/server";
import { isAdminUser } from "@/features/cms/session";
import { isHttpUrl, required } from "@/features/cms/validation";
import type { SkillGroup } from "@/content/skills";

export interface SkillFormData {
  id: string;
  nameEn: string;
  nameVi: string;
  group: SkillGroup;
  categoryEn?: string;
  categoryVi?: string;
  iconKey?: string;
  url?: string;
  order: number;
  featured: boolean;
}

export interface SkillActionResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Partial<Record<keyof SkillFormData, string>>;
}

function validate(data: SkillFormData): SkillActionResult | null {
  const errors: Partial<Record<keyof SkillFormData, string>> = {};

  if (!required(data.id)) errors.id = "Skill ID is required.";
  if (!required(data.nameEn)) errors.nameEn = "EN name is required.";
  if (!required(data.nameVi)) errors.nameVi = "VI name is required.";
  if (data.url && !isHttpUrl(data.url)) errors.url = "URL must be http(s).";

  if (Object.keys(errors).length > 0) {
    return { ok: false, fieldErrors: errors };
  }
  return null;
}

export async function createSkill(
  data: SkillFormData,
): Promise<SkillActionResult> {
  if (!(await isAdminUser())) return { ok: false, error: "Unauthorized." };
  const invalid = validate(data);
  if (invalid) return invalid;

  const client = getServiceClient();
  if (!client) return { ok: false, error: "CMS is not configured." };

  const { error: baseError } = await client.from("skills").insert({
    id: data.id,
    group_key: data.group,
    icon_key: data.iconKey ?? null,
    url: data.url || null,
    order: data.order,
    featured: data.featured,
  });
  if (baseError) return { ok: false, error: baseError.message };

  const { error: transError } = await client.from("skill_translations").insert([
    {
      skill_id: data.id,
      locale: "en",
      name: data.nameEn,
      category: data.categoryEn || null,
    },
    {
      skill_id: data.id,
      locale: "vi",
      name: data.nameVi,
      category: data.categoryVi || null,
    },
  ]);
  if (transError) return { ok: false, error: transError.message };

  revalidatePath("/");
  revalidatePath("/vi");
  revalidatePath("/admin/skills");
  return { ok: true };
}

export async function updateSkill(
  data: SkillFormData,
): Promise<SkillActionResult> {
  if (!(await isAdminUser())) return { ok: false, error: "Unauthorized." };
  const invalid = validate(data);
  if (invalid) return invalid;

  const client = getServiceClient();
  if (!client) return { ok: false, error: "CMS is not configured." };

  const { error: baseError } = await client
    .from("skills")
    .update({
      group_key: data.group,
      icon_key: data.iconKey ?? null,
      url: data.url || null,
      order: data.order,
      featured: data.featured,
    })
    .eq("id", data.id);
  if (baseError) return { ok: false, error: baseError.message };

  const { error: transError } = await client.from("skill_translations").upsert(
    [
      {
        skill_id: data.id,
        locale: "en",
        name: data.nameEn,
        category: data.categoryEn || null,
      },
      {
        skill_id: data.id,
        locale: "vi",
        name: data.nameVi,
        category: data.categoryVi || null,
      },
    ],
    { onConflict: "skill_id,locale" },
  );
  if (transError) return { ok: false, error: transError.message };

  revalidatePath("/");
  revalidatePath("/vi");
  revalidatePath("/admin/skills");
  return { ok: true };
}

export async function deleteSkill(id: string): Promise<SkillActionResult> {
  if (!(await isAdminUser())) return { ok: false, error: "Unauthorized." };

  const client = getServiceClient();
  if (!client) return { ok: false, error: "CMS is not configured." };

  const { error } = await client.from("skills").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/vi");
  revalidatePath("/admin/skills");
  return { ok: true };
}
