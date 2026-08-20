import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { PageShell } from "@/components/layout/page-shell";
import { ContactSection } from "@/components/sections/contact/contact-section";
import { HeroSection } from "@/components/sections/home/hero-section";
import { ProjectsSection } from "@/components/sections/projects/projects-section";
import { ResumeSection } from "@/components/sections/resume/resume-section";
import { ResumeSectionLock } from "@/components/sections/resume/resume-section-lock";
import { SkillsSection } from "@/components/sections/skills/skills-section";
import { getResumeLockContent } from "@/content/resume";
import { getResumePublicity } from "@/features/cms/resume-publicity";
import {
  getContactContent as getCmsContact,
  getFeaturedProjects as getCmsFeaturedProjects,
  getPortfolioProfile as getCmsProfile,
  getResumeContent as getCmsResume,
  getSkillsContent as getCmsSkills,
} from "@/features/cms/repository";
import { getMessages } from "@/features/i18n/messages";
import { getLocaleFromParams } from "@/features/i18n/server";
import { getSeoMetadata } from "@/features/seo/metadata";
import { navigationSectionIds } from "@/features/navigation/config";

interface LocalePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: Readonly<LocalePageProps>): Promise<Metadata> {
  const locale = await getLocaleFromParams(params);
  const messages = await getMessages(locale);

  return getSeoMetadata({
    locale,
    title: messages.metadata.title,
    description: messages.metadata.description,
  });
}

export default async function LocalePage({
  params,
}: Readonly<LocalePageProps>) {
  const locale = await getLocaleFromParams(params);
  const messages = await getMessages(locale);
  const profile = await getCmsProfile(locale);
  const skills = await getCmsSkills(locale);
  const projects = await getCmsFeaturedProjects(locale);
  const contact = await getCmsContact(locale);

  const isResumePrivate = (await getResumePublicity()) === "private";

  return (
    <PageShell>
      <HeroSection profile={profile} />
      <SkillsSection content={skills} />
      <ProjectsSection content={projects} />
      {isResumePrivate ? (
        <ResumeSectionLock content={getResumeLockContent(locale)} />
      ) : (
        <ResumeSection content={await getCmsResume(locale)} />
      )}
      <ContactSection content={contact} />

      {navigationSectionIds.slice(6).map((sectionId) => (
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
