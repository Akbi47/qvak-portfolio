import { getServiceClient } from "@/features/cms/server";
import type { ResumePublicity } from "@/features/cms/resume-publicity";

export interface SettingsView {
  publicity: ResumePublicity;
  changedAt: string | null;
  changedBy: string | null;
}

export async function getSettingsView(): Promise<SettingsView> {
  const client = getServiceClient();

  if (!client) {
    return { publicity: "private", changedAt: null, changedBy: null };
  }

  const { data } = await client
    .from("app_settings")
    .select("value, changed_at, changed_by")
    .eq("key", "resume.publicity")
    .maybeSingle();

  if (!data) {
    return { publicity: "private", changedAt: null, changedBy: null };
  }

  const publicity: ResumePublicity =
    data.value === "visible" ? "visible" : "private";

  return {
    publicity,
    changedAt: data.changed_at ?? null,
    changedBy: data.changed_by ?? null,
  };
}
