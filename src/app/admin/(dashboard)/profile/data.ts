import { getServiceClient } from "@/features/cms/server";

export interface AdminProfileView {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  githubUrl: string | null;
  linkedinUrl: string | null;
  resumeUrl: string | null;
  phone: string | null;
  email: string | null;
  roleEn: string;
  roleVi: string;
  introEn: string;
  introVi: string;
  locationEn: string | null;
  locationVi: string | null;
}

export async function getProfileView(): Promise<AdminProfileView | null> {
  const client = getServiceClient();
  if (!client) return null;

  const { data, error } = await client
    .from("profile")
    .select(
      "id, slug, name, short_name, github_url, linkedin_url, resume_url, phone, email, profile_translations(locale, role, intro, location)",
    )
    .maybeSingle();

  if (error || !data) return null;

  const translations = (data.profile_translations ?? []) as Array<{
    locale: string;
    role: string;
    intro: string;
    location: string | null;
  }>;
  const en = translations.find((t) => t.locale === "en");
  const vi = translations.find((t) => t.locale === "vi");

  return {
    id: data.id,
    slug: data.slug,
    name: data.name ?? "",
    shortName: data.short_name ?? "",
    githubUrl: data.github_url,
    linkedinUrl: data.linkedin_url,
    resumeUrl: data.resume_url,
    phone: data.phone,
    email: data.email,
    roleEn: en?.role ?? "",
    roleVi: vi?.role ?? "",
    introEn: en?.intro ?? "",
    introVi: vi?.intro ?? "",
    locationEn: en?.location ?? null,
    locationVi: vi?.location ?? null,
  };
}