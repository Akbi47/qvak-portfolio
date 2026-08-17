import type { Metadata } from "next";

import { getPortfolioProfile } from "@/content/profile";
import { locales, type Locale } from "@/features/i18n/config";
import { getLocalizedPathname } from "@/features/i18n/routing";

import { getAbsoluteUrl, getSiteUrl } from "./config";

const ogLocaleBySiteLocale: Record<Locale, string> = {
  en: "en_US",
  vi: "vi_VN",
};

function getAlternateLanguages(): Record<string, string> {
  const languages: Record<string, string> = {};

  for (const locale of locales) {
    languages[locale] = getAbsoluteUrl(getLocalizedPathname("/", locale));
  }

  languages["x-default"] = getAbsoluteUrl(getLocalizedPathname("/", "en"));

  return languages;
}

export interface SeoMetadataInput {
  locale: Locale;
  title: string;
  description: string;
}

export function getSeoMetadata({
  locale,
  title,
  description,
}: SeoMetadataInput): Metadata {
  const pathname = getLocalizedPathname("/", locale);
  const url = getAbsoluteUrl(pathname);
  const profile = getPortfolioProfile(locale);
  const ogImage = getAbsoluteUrl(profile.hero.image.src);

  return {
    metadataBase: new URL(getSiteUrl()),
    title,
    description,
    alternates: {
      canonical: pathname,
      languages: getAlternateLanguages(),
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: "website",
      locale: ogLocaleBySiteLocale[locale],
      url,
      siteName: title,
      title,
      description,
      images: [{ url: ogImage, width: 852, height: 1280, alt: profile.hero.image.alt }],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [ogImage],
    },
  };
}
