import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import type { Locale } from "@/features/i18n/config";
import { contactDetails } from "@/content/contact";
import { portfolioProfile } from "@/content/profile";
import { projects, type Project } from "@/content/projects";
import { resumeEntries, type ResumeEntry } from "@/content/resume";
import { skills } from "@/content/skills";

const locales: Locale[] = ["en", "vi"];

const publicRoot = join(process.cwd(), "public");

const allProjects = projects as ReadonlyArray<Project>;
const allEntries = resumeEntries as ReadonlyArray<ResumeEntry>;

const forbiddenEmployerNames = [
  "Dynamic Global Solutions",
  "Dynamic Global Solution",
  "EnglishWing",
  "SmartIT",
  "Zenitech",
];

function collectStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") {
    out.push(value);
  } else if (Array.isArray(value)) {
    for (const item of value) {
      collectStrings(item, out);
    }
  } else if (value && typeof value === "object") {
    for (const nested of Object.values(value as Record<string, unknown>)) {
      collectStrings(nested, out);
    }
  }
  return out;
}

function collectPublishedStrings(value: unknown, out: string[] = []): string[] {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectPublishedStrings(item, out);
    }
    return out;
  }

  if (typeof value !== "object" || value === null) {
    if (typeof value === "string") {
      out.push(value);
    }
    return out;
  }

  const record = value as Record<string, unknown>;

  for (const [key, nested] of Object.entries(record)) {
    if (key === "id" || key === "slug") {
      continue;
    }
    collectPublishedStrings(nested, out);
  }

  return out;
}

test("every project is complete for both locales", () => {
  for (const project of allProjects) {
    for (const locale of locales) {
      assert.ok(
        project.title[locale].length > 0,
        `project ${project.id} missing en/vi title`,
      );
      assert.ok(
        project.summary[locale].length > 0,
        `project ${project.id} missing en/vi summary`,
      );
      for (const media of project.media) {
        assert.ok(media.alt[locale].length > 0, `project ${project.id} media alt`);
      }
    }
  }
});

test("every resume entry is complete for both locales", () => {
  for (const entry of allEntries) {
    for (const locale of locales) {
      assert.ok(entry.title[locale].length > 0, `entry ${entry.id} title`);
      for (const media of entry.media ?? []) {
        assert.ok(media.alt[locale].length > 0, `entry ${entry.id} media alt`);
        assert.ok(media.width && media.width > 0, `entry ${entry.id} media width`);
        assert.ok(media.height && media.height > 0, `entry ${entry.id} media height`);
      }
    }
  }
});

test("no employer or client names are published anywhere (D3)", () => {
  const allContent = [
    portfolioProfile,
    projects,
    resumeEntries,
    contactDetails,
    skills,
  ];
  const haystack = collectPublishedStrings(allContent)
    .join("\n")
    .toLowerCase();

  for (const name of forbiddenEmployerNames) {
    assert.ok(
      !haystack.includes(name.toLowerCase()),
      `forbidden employer/client name found in content: ${name}`,
    );
  }
});

test("legacy project slug is preserved for redirect compatibility", () => {
  const landing = allProjects.find(
    (project) => project.id === "dynamic-global-solution-landing-page",
  );

  assert.ok(landing, "landing page project still present (D2 temporary dataset)");
  assert.equal(landing.slug, "dynamic-global-solution-landing-page");
});

test("no fake or placeholder external links", () => {
  const links = collectStrings([
    portfolioProfile.githubUrl,
    allProjects
      .flatMap((project) => [project.liveDemoUrl, project.codeUrl])
      .filter(Boolean),
    contactDetails,
  ]).filter((value) => value.startsWith("http") || value.startsWith("/"));

  for (const link of links) {
    assert.ok(
      !link.includes("#"),
      `placeholder/fake link detected: ${link}`,
    );
  }
});

test("no resumeUrl is wired until a real CV exists (D5)", () => {
  assert.equal(
    "resumeUrl" in portfolioProfile ? portfolioProfile.resumeUrl : undefined,
    undefined,
    "resumeUrl must be omitted until the owner supplies a real CV file and stable URL",
  );
});

test("contact/social destinations are GitHub only (D8)", () => {
  const detailIds = Object.keys(contactDetails);
  assert.deepEqual(detailIds.sort(), ["github"]);
  assert.ok(contactDetails.github.href.startsWith("https://github.com/"));
});

test("referenced public images exist on disk", () => {
  const mediaSources = [
    portfolioProfile.media.hero.src,
    ...portfolioProfile.media.aboutPortraits.map((portrait) => portrait.src),
    ...allProjects.flatMap((project) => project.media.map((media) => media.src)),
    ...allEntries.flatMap((entry) =>
      (entry.media ?? []).flatMap((media) => [
        media.thumbnailSrc,
        media.fullSrc,
      ]),
    ),
  ];

  for (const source of mediaSources) {
    assert.ok(
      existsSync(join(publicRoot, source.replace(/^\//, ""))),
      `missing public asset: ${source}`,
    );
  }
});

test("all featured projects carry a real destination or none is faked", () => {
  for (const project of allProjects.filter((project) => project.featured)) {
    for (const url of [project.liveDemoUrl, project.codeUrl]) {
      assert.ok(
        url === undefined || url.startsWith("https://"),
        `project ${project.id} has a non-https link: ${url}`,
      );
    }
  }
});