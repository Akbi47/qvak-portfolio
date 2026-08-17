import type { MetadataRoute } from "next";

import { locales } from "@/features/i18n/config";
import { getLocalizedPathname } from "@/features/i18n/routing";
import { getAbsoluteUrl } from "@/features/seo/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const defaultPathname = getLocalizedPathname("/", "en");
  const languages: Record<string, string> = {};

  for (const locale of locales) {
    languages[locale] = getAbsoluteUrl(getLocalizedPathname("/", locale));
  }

  languages["x-default"] = getAbsoluteUrl(defaultPathname);

  return [
    {
      url: getAbsoluteUrl(defaultPathname),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
      alternates: { languages },
    },
    ...locales
      .filter((locale) => locale !== "en")
      .map((locale) => ({
        url: getAbsoluteUrl(getLocalizedPathname("/", locale)),
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 1,
        alternates: { languages },
      })),
  ];
}
