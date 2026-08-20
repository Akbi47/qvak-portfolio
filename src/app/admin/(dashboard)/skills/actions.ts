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

  // Single-transaction write: base row + both translation rows roll back together
  // on any failure (see migration cms_atomic_mutations).
  const { error } = await client.rpc("cms_upsert_skill", {
    p_id: data.id,
    p_group_key: data.group,
    p_icon_key: data.iconKey ?? null,
    p_url: data.url || null,
    p_order: data.order,
    p_featured: data.featured,
    p_name_en: data.nameEn.trim(),
    p_name_vi: data.nameVi.trim(),
    p_category_en: data.categoryEn?.trim() || null,
    p_category_vi: data.categoryVi?.trim() || null,
  });
  if (error) return { ok: false, error: error.message };

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

  const { error } = await client.rpc("cms_upsert_skill", {
    p_id: data.id,
    p_group_key: data.group,
    p_icon_key: data.iconKey ?? null,
    p_url: data.url || null,
    p_order: data.order,
    p_featured: data.featured,
    p_name_en: data.nameEn.trim(),
    p_name_vi: data.nameVi.trim(),
    p_category_en: data.categoryEn?.trim() || null,
    p_category_vi: data.categoryVi?.trim() || null,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/vi");
  revalidatePath("/admin/skills");
  return { ok: true };
}

export async function deleteSkill(id: string): Promise<SkillActionResult> {
  if (!(await isAdminUser())) return { ok: false, error: "Unauthorized." };

  const client = getServiceClient();
  if (!client) return { ok: false, error: "CMS is not configured." };

  const { error } = await client.rpc("cms_delete_skill", { p_id: id });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/vi");
  revalidatePath("/admin/skills");
  return { ok: true };
}
