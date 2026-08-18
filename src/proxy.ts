import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { defaultLocale, locales } from "@/features/i18n/config";
import {
  buildRedirectUrl,
  getLegacyRedirectTarget,
  normalizeTrailingSlash,
} from "@/features/seo/redirects";

const localeRewriteHeader = "x-qvak-locale-rewrite";

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { pathname } = url;
  const pathnameLocale = locales.find(
    (locale) =>
      pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  const requestHeaders = new Headers(request.headers);

  const requestedLocale = pathnameLocale ?? defaultLocale;
  const legacyPathname = pathnameLocale
    ? pathname.slice(pathnameLocale.length + 1)
    : pathname;
  const legacyTarget = getLegacyRedirectTarget(requestedLocale, legacyPathname);

  if (legacyTarget) {
    return NextResponse.redirect(
      buildRedirectUrl(
        url.origin,
        legacyTarget.pathname,
        url.search,
        legacyTarget.hash,
      ),
      301,
    );
  }

  if (pathnameLocale === defaultLocale) {
    if (requestHeaders.get(localeRewriteHeader) === defaultLocale) {
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    url.pathname = pathname.slice(defaultLocale.length + 1) || "/";
    return NextResponse.redirect(url);
  }

  const normalizedPathname = normalizeTrailingSlash(pathname);

  if (normalizedPathname) {
    return NextResponse.redirect(
      buildRedirectUrl(url.origin, normalizedPathname, url.search, url.hash),
      308,
    );
  }

  requestHeaders.set(localeRewriteHeader, requestedLocale);

  if (pathnameLocale) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  requestHeaders.set(localeRewriteHeader, defaultLocale);

  return NextResponse.rewrite(url, {
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
