import type { ReactNode } from "react";

import { locales } from "@/features/i18n/config";
import { getLocaleFromParams } from "@/features/i18n/server";
import { ThemeProvider } from "@/features/theme/theme-provider";
import { ThemeScript } from "@/features/theme/theme-script";

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
    <html data-theme="light" lang={locale} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
