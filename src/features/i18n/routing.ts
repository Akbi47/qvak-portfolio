import {
  defaultLocale,
  locales,
  type Locale,
} from "@/features/i18n/config";

function withoutLocalePrefix(pathname: string): string {
  const locale = locales.find(
    (candidate) =>
      pathname === `/${candidate}` || pathname.startsWith(`/${candidate}/`),
  );
  const unprefixedPathname = locale
    ? pathname.slice(locale.length + 1)
    : pathname;

  return unprefixedPathname || "/";
}

export function getLocalizedPathname(
  pathname: string,
  locale: Locale,
): string {
  const logicalPathname = withoutLocalePrefix(pathname);

  if (locale === defaultLocale) {
    return logicalPathname;
  }

  return logicalPathname === "/"
    ? `/${locale}`
    : `/${locale}${logicalPathname}`;
}
