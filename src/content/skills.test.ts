import assert from "node:assert/strict";
import { test } from "node:test";

import { skillIcons } from "@/components/sections/skills/skill-icons";
import type { Locale } from "@/features/i18n/config";

import { getSkillsContent } from "./skills";

const locales: Locale[] = ["en", "vi"];

const approvedTechStack = [
  "TypeScript",
  "JavaScript",
  "Python",
  "Node.js",
  "NestJS",
  "React",
  "Next.js",
  "MongoDB",
  "PostgreSQL",
  "MySQL",
  "Docker",
  "AWS",
  "DigitalOcean",
  "Firebase",
  "Azure DevOps",
  "Tailwind CSS",
  "SCSS",
  "WordPress",
  "WSL",
  "Linux",
];

const approvedGroups = [
  {
    name: "Architecture",
    subtitle: "Backend architecture & engineering practices.",
    skills: [
      "REST API",
      "Clean Architecture",
      "Dependency Injection",
      "API Integration",
    ],
  },
  {
    name: "DevOps & Infrastructure",
    subtitle: "Infrastructure, deployment and cloud technologies.",
    skills: [
      "AWS",
      "DigitalOcean",
      "Firebase",
      "Azure DevOps",
      "Docker",
      "VPS",
      "Linux",
      "WSL",
    ],
  },
  {
    name: "Frontend & UX",
    subtitle:
      "Building responsive, accessible and optimized web experiences.",
    skills: [
      "Responsive Design",
      "Web Accessibility",
      "Performance Optimization",
      "Core Web Vitals",
      "Localization",
    ],
  },
  {
    name: "SEO & Growth",
    subtitle: "Improving website visibility, structure and growth.",
    skills: [
      "Technical SEO",
      "On-page SEO",
      "Off-page SEO",
      "Google Ads",
      "WordPress",
      "Website Architecture",
      "Keyword Research",
    ],
  },
  {
    name: "Workflow & Collaboration",
    subtitle:
      "Working effectively across engineering teams and product workflows.",
    skills: [
      "Git",
      "GitHub",
      "GitLab",
      "JIRA",
      "Agile / Scrum",
      "Code Review",
      "Pair Programming",
      "Cross-functional Collaboration",
      "Requirement Analysis",
      "Technical Planning",
    ],
  },
  {
    name: "Product & Creative",
    subtitle: "Product creation, visual content and digital promotion.",
    skills: [
      "Canva",
      "Adobe Photoshop",
      "CapCut",
      "Content Creation",
      "Visual Design",
      "Product Presentation",
      "Digital Content",
    ],
  },
];

const approvedAgenticSections = [
  {
    name: "AI Models & Assistants",
    skills: ["ChatGPT", "Claude", "Google Gemini", "DeepSeek"],
  },
  {
    name: "Agentic Coding & Harness",
    skills: [
      "OpenCode",
      "Codex Desktop / CLI",
      "Claude CLI",
      "Antigravity",
      "CommandCode",
      "OpenClaw",
    ],
  },
  {
    name: "AI Development Capabilities",
    skills: [
      "Agentic Coding",
      "Multi-agent Workflows",
      "AI-assisted Development",
      "Context Engineering",
      "Tool / MCP Integration",
      "AI Workflow Orchestration",
      "Repository-aware Development",
    ],
  },
];

test("tech stack lists exactly the 20 approved skills in order", () => {
  for (const locale of locales) {
    const content = getSkillsContent(locale);
    assert.equal(content.techStack.length, 20);
    if (locale === "en") {
      assert.deepEqual(
        content.techStack.map((skill) => skill.name),
        approvedTechStack,
      );
    }
  }
});

test("every tech-stack icon key resolves to a real glyph", () => {
  const content = getSkillsContent("en");
  for (const skill of content.techStack) {
    if (!skill.iconKey) {
      continue;
    }
    const icon = skillIcons[skill.iconKey];
    assert.ok(icon, `no glyph registered for ${skill.id}`);
    assert.ok(icon.path.length > 50, `glyph too short for ${skill.id}`);
  }
});

test("others tab contains exactly the 7 approved groups in order", () => {
  const content = getSkillsContent("en");
  assert.equal(content.otherCategories.length, 7);
  assert.deepEqual(
    content.otherCategories.map((category) => category.name),
    [...approvedGroups.map((group) => group.name), "Agentic AI & AI Development"],
  );
});

test("each flat group carries its subtitle and exact approved skills", () => {
  for (const locale of locales) {
    const content = getSkillsContent(locale);
    approvedGroups.forEach((group, index) => {
      const category = content.otherCategories[index];
      assert.equal(category.name, locale === "en" ? group.name : category.name);
      assert.ok(category.subtitle, `${group.name} missing subtitle (${locale})`);
      if (locale === "en") {
        assert.equal(category.subtitle, group.subtitle);
        assert.deepEqual(
          category.skills.map((skill) => skill.name),
          group.skills,
        );
      }
      assert.equal(category.sections, undefined, `${group.name} must be flat`);
    });
  }
});

test("agentic AI group is featured with three sub-sections and exact skills", () => {
  for (const locale of locales) {
    const content = getSkillsContent(locale);
    const agentic = content.otherCategories[6];
    assert.equal(agentic.featured, true);
    assert.equal(
      agentic.subtitle,
      locale === "en"
        ? "AI-assisted engineering, coding agents and autonomous development workflows."
        : agentic.subtitle,
    );
    assert.equal(agentic.skills.length, 0, "agentic skills live in sections");
    assert.deepEqual(
      agentic.sections?.map((section) => section.name),
      locale === "en"
        ? approvedAgenticSections.map((section) => section.name)
        : agentic.sections?.map((section) => section.name),
    );
    if (locale === "en") {
      agentic.sections?.forEach((section, index) => {
        assert.deepEqual(
          section.skills.map((skill) => skill.name),
          approvedAgenticSections[index].skills,
        );
      });
    }
  }
});
