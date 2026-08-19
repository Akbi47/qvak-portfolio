"use server";

import { revalidatePath } from "next/cache";

import { getServiceClient } from "@/features/cms/server";
import { getServerClient, isAdminUser } from "@/features/cms/session";

export interface TogglePublicityResult {
  ok: boolean;
  error?: string;
  value?: "private" | "visible";
}

export async function setResumePublicity(
  next: "private" | "visible",
): Promise<TogglePublicityResult> {
  if (!(await isAdminUser())) {
    return { ok: false, error: "Unauthorized." };
  }

  const client = getServiceClient();
  if (!client) {
    return { ok: false, error: "CMS is not configured." };
  }

  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await client
    .from("app_settings")
    .upsert(
      {
        key: "resume.publicity",
        value: JSON.stringify(next),
        changed_at: new Date().toISOString(),
        changed_by: user?.email ?? null,
      },
      { onConflict: "key" },
    );

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/vi");

  return { ok: true, value: next };
}
