import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { PageShell } from "@/components/layout/page-shell";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { getMessages } from "@/features/i18n/messages";
import { getLocaleFromParams } from "@/features/i18n/server";
import { navigationSectionIds } from "@/features/navigation/config";

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
      <Section
        aria-labelledby="foundation-title"
        className="navigation-anchor navigation-anchor--home"
        id="home"
        surface="elevated"
      >
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

      {navigationSectionIds.slice(1).map((sectionId) => (
        <section
          aria-labelledby={`${sectionId}-anchor-title`}
          className="navigation-anchor navigation-anchor--placeholder"
          id={sectionId}
          key={sectionId}
        >
          <Container>
            <h2
              className="navigation-anchor__title"
              id={`${sectionId}-anchor-title`}
            >
              {messages.header.sections[sectionId]}
            </h2>
          </Container>
        </section>
      ))}
    </PageShell>
  );
}
