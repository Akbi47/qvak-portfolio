import { getServiceClient } from "./server";

export type ResumePublicity = "private" | "visible";

const PUBLICITY_KEY = "resume.publicity";

let testOverride: ResumePublicity | null = null;

export function setResumePublicityForTest(
  value: ResumePublicity | null,
): void {
  testOverride = value;
}

export async function getResumePublicity(): Promise<ResumePublicity> {
  if (testOverride !== null) {
    return testOverride;
  }

  const client = getServiceClient();

  if (!client) {
    return "private";
  }

  try {
    const { data, error } = await client
      .from("app_settings")
      .select("value")
      .eq("key", PUBLICITY_KEY)
      .maybeSingle();

    if (error || !data) {
      return "private";
    }

    return data.value === "visible" ? "visible" : "private";
  } catch {
    return "private";
  }
}
