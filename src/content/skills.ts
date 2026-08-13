import type { Locale } from "@/features/i18n/config";

type LocalizedText = Readonly<Record<Locale, string>>;

export type SkillGroup = "tech-stack" | "others";

export type SkillIconKey =
  | "typescript"
  | "javascript"
  | "react"
  | "nextjs"
  | "nodejs"
  | "nestjs"
  | "postgresql"
  | "wordpress";

export interface Skill {
  id: string;
  name: LocalizedText;
  group: SkillGroup;
  category?: LocalizedText;
  iconKey?: SkillIconKey;
  order: number;
  featured?: boolean;
}

export interface SkillView {
  id: string;
  name: string;
  iconKey?: SkillIconKey;
}

export interface SkillCategoryView {
  id: string;
  name: string;
  skills: ReadonlyArray<SkillView>;
}

export interface SkillsContentView {
  eyebrow: string;
  title: string;
  description: string;
  tabsLabel: string;
  tabs: Readonly<Record<SkillGroup, string>>;
  panels: Readonly<Record<SkillGroup, string>>;
  techStack: ReadonlyArray<SkillView>;
  otherCategories: ReadonlyArray<SkillCategoryView>;
}

const skillCopy = {
  eyebrow: {
    en: "Capabilities",
    vi: "Năng lực",
  },
  title: {
    en: "Skills built for useful products.",
    vi: "Kỹ năng để xây dựng sản phẩm hữu ích.",
  },
  description: {
    en: "A practical toolkit for shaping dependable web experiences, from interface to infrastructure.",
    vi: "Bộ kỹ năng thực tiễn để tạo nên trải nghiệm web đáng tin cậy, từ giao diện đến hạ tầng.",
  },
  tabsLabel: {
    en: "Skill categories",
    vi: "Nhóm kỹ năng",
  },
  tabs: {
    "tech-stack": {
      en: "Tech Stack",
      vi: "Công nghệ",
    },
    others: {
      en: "Others",
      vi: "Kỹ năng khác",
    },
  },
  panels: {
    "tech-stack": {
      en: "Core technologies used to build and ship web products.",
      vi: "Các công nghệ cốt lõi dùng để xây dựng và đưa sản phẩm web vào vận hành.",
    },
    others: {
      en: "Complementary skills grouped by the work they support.",
      vi: "Các kỹ năng bổ trợ được nhóm theo công việc mà chúng hỗ trợ.",
    },
  },
} as const;

export const skills = [
  {
    id: "typescript",
    name: { en: "TypeScript", vi: "TypeScript" },
    group: "tech-stack",
    iconKey: "typescript",
    order: 1,
    featured: true,
  },
  {
    id: "javascript",
    name: { en: "JavaScript", vi: "JavaScript" },
    group: "tech-stack",
    iconKey: "javascript",
    order: 2,
    featured: true,
  },
  {
    id: "react",
    name: { en: "React", vi: "React" },
    group: "tech-stack",
    iconKey: "react",
    order: 3,
    featured: true,
  },
  {
    id: "nextjs",
    name: { en: "Next.js", vi: "Next.js" },
    group: "tech-stack",
    iconKey: "nextjs",
    order: 4,
    featured: true,
  },
  {
    id: "nodejs",
    name: { en: "Node.js", vi: "Node.js" },
    group: "tech-stack",
    iconKey: "nodejs",
    order: 5,
  },
  {
    id: "nestjs",
    name: { en: "NestJS", vi: "NestJS" },
    group: "tech-stack",
    iconKey: "nestjs",
    order: 6,
  },
  {
    id: "postgresql",
    name: { en: "PostgreSQL", vi: "PostgreSQL" },
    group: "tech-stack",
    iconKey: "postgresql",
    order: 7,
  },
  {
    id: "wordpress",
    name: { en: "WordPress", vi: "WordPress" },
    group: "tech-stack",
    iconKey: "wordpress",
    order: 8,
  },
  {
    id: "responsive-design",
    name: { en: "Responsive design", vi: "Thiết kế responsive" },
    group: "others",
    category: { en: "Frontend craft", vi: "Hoàn thiện frontend" },
    order: 1,
  },
  {
    id: "accessibility",
    name: { en: "Web accessibility", vi: "Khả năng tiếp cận web" },
    group: "others",
    category: { en: "Frontend craft", vi: "Hoàn thiện frontend" },
    order: 2,
  },
  {
    id: "localization",
    name: { en: "Localization", vi: "Bản địa hóa" },
    group: "others",
    category: { en: "Frontend craft", vi: "Hoàn thiện frontend" },
    order: 3,
  },
  {
    id: "api-integration",
    name: { en: "API integration", vi: "Tích hợp API" },
    group: "others",
    category: { en: "Product engineering", vi: "Kỹ thuật sản phẩm" },
    order: 4,
  },
  {
    id: "performance",
    name: { en: "Performance optimization", vi: "Tối ưu hiệu năng" },
    group: "others",
    category: { en: "Product engineering", vi: "Kỹ thuật sản phẩm" },
    order: 5,
  },
  {
    id: "seo",
    name: { en: "Technical SEO", vi: "SEO kỹ thuật" },
    group: "others",
    category: { en: "Product engineering", vi: "Kỹ thuật sản phẩm" },
    order: 6,
  },
  {
    id: "git",
    name: { en: "Git", vi: "Git" },
    group: "others",
    category: { en: "Workflow", vi: "Quy trình làm việc" },
    order: 7,
  },
  {
    id: "github",
    name: { en: "GitHub", vi: "GitHub" },
    group: "others",
    category: { en: "Workflow", vi: "Quy trình làm việc" },
    order: 8,
  },
  {
    id: "docker",
    name: { en: "Docker", vi: "Docker" },
    group: "others",
    category: { en: "Workflow", vi: "Quy trình làm việc" },
    order: 9,
  },
] as const satisfies ReadonlyArray<Skill>;

function localizeSkill(skill: Skill, locale: Locale): SkillView {
  return {
    id: skill.id,
    name: skill.name[locale],
    iconKey: skill.iconKey,
  };
}

export function getSkillsContent(locale: Locale): SkillsContentView {
  const techStack = skills
    .filter((skill) => skill.group === "tech-stack")
    .sort((left, right) => left.order - right.order)
    .map((skill) => localizeSkill(skill, locale));

  const otherSkills = skills
    .filter((skill) => skill.group === "others")
    .sort((left, right) => left.order - right.order);
  const categories = new Map<string, SkillCategoryView>();

  for (const skill of otherSkills) {
    const categoryName = skill.category?.[locale];

    if (!categoryName) {
      continue;
    }

    const existingCategory = categories.get(categoryName);
    const localizedSkill = localizeSkill(skill, locale);

    if (existingCategory) {
      categories.set(categoryName, {
        ...existingCategory,
        skills: [...existingCategory.skills, localizedSkill],
      });
    } else {
      categories.set(categoryName, {
        id: skill.category?.en.toLowerCase().replaceAll(" ", "-") ?? skill.id,
        name: categoryName,
        skills: [localizedSkill],
      });
    }
  }

  return {
    eyebrow: skillCopy.eyebrow[locale],
    title: skillCopy.title[locale],
    description: skillCopy.description[locale],
    tabsLabel: skillCopy.tabsLabel[locale],
    tabs: {
      "tech-stack": skillCopy.tabs["tech-stack"][locale],
      others: skillCopy.tabs.others[locale],
    },
    panels: {
      "tech-stack": skillCopy.panels["tech-stack"][locale],
      others: skillCopy.panels.others[locale],
    },
    techStack,
    otherCategories: [...categories.values()],
  };
}
