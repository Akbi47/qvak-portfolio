import type { Locale } from "@/features/i18n/config";
import { getLocalizedPathname } from "@/features/i18n/routing";

export interface LegacyRedirectTarget {
  pathname: string;
  hash: string;
}

const legacyRedirects = {
  "/resume": "#resume",
  "/resume/": "#resume",
  "/case-studies": "#projects",
  "/case-studies/": "#projects",
} as const;

export function getLegacyRedirectTarget(
  locale: Locale,
  pathname: string,
): LegacyRedirectTarget | null {
  const fragment = legacyRedirects[pathname as keyof typeof legacyRedirects];

  if (!fragment) {
    return null;
  }

  return {
    pathname: getLocalizedPathname("/", locale),
    hash: fragment,
  };
}

export function normalizeTrailingSlash(pathname: string): string | null {
  if (pathname === "/" || !pathname.endsWith("/")) {
    return null;
  }

  return pathname.replace(/\/+$/, "") || "/";
}

export function buildRedirectUrl(
  origin: string,
  pathname: string,
  search: string,
  hash: string,
): URL {
  const target = new URL(origin);
  target.pathname = pathname;
  target.search = search;
  target.hash = hash;
  return target;
}
