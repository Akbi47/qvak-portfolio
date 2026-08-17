import { headers } from "next/headers";

import { Container } from "@/components/layout/container";
import {
  defaultLocale,
  isLocale,
  type Locale,
} from "@/features/i18n/config";
import { getMessages } from "@/features/i18n/messages";
import { getLocalizedPathname } from "@/features/i18n/routing";
import { ThemeScript } from "@/features/theme/theme-script";

import "@/styles/globals.css";

const localeRewriteHeader = "x-qvak-locale-rewrite";

export default async function NotFound() {
  const headerStore = await headers();
  const headerLocale = headerStore.get(localeRewriteHeader);
  const locale: Locale =
    headerLocale !== null && isLocale(headerLocale)
      ? headerLocale
      : defaultLocale;
  const messages = await getMessages(locale);
  const homePath = getLocalizedPathname("/", locale);

  return (
    <html data-theme="light" lang={locale} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <main className="page-shell">
          <section className="not-found">
            <Container size="narrow">
              <div className="not-found__card">
                <p className="not-found__eyebrow" role="text">
                  {messages.notFound.eyebrow}
                </p>
                <h1 className="not-found__title">{messages.notFound.title}</h1>
                <p className="not-found__description">
                  {messages.notFound.description}
                </p>
                <a className="not-found__action" href={homePath}>
                  {messages.notFound.homeAction}
                </a>
              </div>
            </Container>
          </section>
        </main>
      </body>
    </html>
  );
}
