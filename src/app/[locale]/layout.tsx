import type { ReactNode } from "react";

import { locales } from "@/features/i18n/config";
import { getLocaleFromParams } from "@/features/i18n/server";

import "@/styles/globals.css";

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<LocaleLayoutProps>) {
  const locale = await getLocaleFromParams(params);

  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
