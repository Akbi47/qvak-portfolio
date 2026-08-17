import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { defaultLocale, locales, type Locale } from "@/features/i18n/config";
import { getLocalizedPathname } from "@/features/i18n/routing";

const localeRewriteHeader = "x-qvak-locale-rewrite";

const legacyRedirects = {
  "/resume": "#resume",
  "/resume/": "#resume",
  "/case-studies": "#projects",
  "/case-studies/": "#projects",
} as const;

function getLegacyRedirect(locale: Locale, pathname: string): string | null {
  const fragment = legacyRedirects[pathname as keyof typeof legacyRedirects];

  if (!fragment) {
    return null;
  }

  return `${getLocalizedPathname("/", locale)}${fragment}`;
}

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { pathname } = url;
  const pathnameLocale = locales.find(
    (locale) =>
      pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  if (pathnameLocale === defaultLocale) {
    if (request.headers.get(localeRewriteHeader) === defaultLocale) {
      return NextResponse.next();
    }

    url.pathname = pathname.slice(defaultLocale.length + 1) || "/";
    return NextResponse.redirect(url);
  }

  const requestedLocale = pathnameLocale ?? defaultLocale;
  const legacyPathname = pathnameLocale
    ? pathname.slice(pathnameLocale.length + 1)
    : pathname;
  const redirectPath = getLegacyRedirect(requestedLocale, legacyPathname);

  if (redirectPath) {
    return NextResponse.redirect(
      `${url.origin}${redirectPath}${url.search}`,
      301,
    );
  }

  if (pathnameLocale) {
    return NextResponse.next();
  }

  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(localeRewriteHeader, defaultLocale);

  return NextResponse.rewrite(url, {
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
