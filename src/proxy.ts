import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { defaultLocale, locales } from "@/features/i18n/config";

const localeRewriteHeader = "x-qvak-locale-rewrite";

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
