import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { PageShell } from "@/components/layout/page-shell";
import { HeroSection } from "@/components/sections/home/hero-section";
import { ProjectsSection } from "@/components/sections/projects/projects-section";
import { ResumeSection } from "@/components/sections/resume/resume-section";
import { SkillsSection } from "@/components/sections/skills/skills-section";
import { getPortfolioProfile } from "@/content/profile";
import { getFeaturedProjects } from "@/content/projects";
import { getResumeContent } from "@/content/resume";
import { getSkillsContent } from "@/content/skills";
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
  const skills = getSkillsContent(locale);
  const projects = getFeaturedProjects(locale);
  const resume = getResumeContent(locale);

  return (
    <PageShell>
      <HeroSection profile={profile} />
      <SkillsSection content={skills} />
      <ProjectsSection content={projects} />
      <ResumeSection content={resume} />

      {navigationSectionIds.slice(5).map((sectionId) => (
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
