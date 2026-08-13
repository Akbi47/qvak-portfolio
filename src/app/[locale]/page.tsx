import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { PageShell } from "@/components/layout/page-shell";
import { AboutSection } from "@/components/sections/about/about-section";
import { HeroSection } from "@/components/sections/home/hero-section";
import { getPortfolioProfile } from "@/content/profile";
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
  const profile = getPortfolioProfile(locale);

  return (
    <PageShell>
      <HeroSection profile={profile} />
      <AboutSection messages={messages.aboutSlider} profile={profile} />

      {navigationSectionIds.slice(2).map((sectionId) => (
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
