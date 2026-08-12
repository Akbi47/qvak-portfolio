import type { Metadata } from "next";

import { PageShell } from "@/components/layout/page-shell";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { LocaleSwitcher } from "@/features/i18n/locale-switcher";
import { getMessages } from "@/features/i18n/messages";
import { getLocaleFromParams } from "@/features/i18n/server";

interface LocalePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: Readonly<LocalePageProps>): Promise<Metadata> {
  const locale = await getLocaleFromParams(params);
  const messages = await getMessages(locale);

  return {
    title: messages.metadata.title,
    description: messages.metadata.description,
  };
}

export default async function LocalePage({
  params,
}: Readonly<LocalePageProps>) {
  const locale = await getLocaleFromParams(params);
  const messages = await getMessages(locale);

  return (
    <PageShell>
      <Section aria-labelledby="foundation-title" surface="elevated">
        <LocaleSwitcher locale={locale} messages={messages.localeSwitcher} />

        <SectionHeading
          description={messages.foundation.description}
          eyebrow={messages.foundation.eyebrow}
          level="h1"
          title={messages.foundation.title}
          titleId="foundation-title"
        />

        <div className="foundation-grid">
          {messages.foundation.items.map((item) => (
            <article className="foundation-card" key={item.id}>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </Section>
    </PageShell>
  );
}
