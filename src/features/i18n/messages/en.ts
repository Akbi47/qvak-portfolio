import type { PortfolioMessages } from "@/features/i18n/messages/types";

const messages = {
  metadata: {
    title: "Quach Vo Anh Khoa",
    description: "Portfolio foundation for Quach Vo Anh Khoa.",
  },
  localeSwitcher: {
    label: "Language",
    english: "English",
    vietnamese: "Tiếng Việt",
  },
  themeToggle: {
    toggle: "Toggle color theme",
    switchToLight: "Switch to light theme",
    switchToDark: "Switch to dark theme",
  },
  foundation: {
    eyebrow: "Portfolio foundation",
    title: "A clear frame for the work ahead.",
    description:
      "The shared design system and page shell are ready for portfolio sections to build on.",
    items: [
      {
        id: "responsive",
        title: "Responsive by default",
        description:
          "A shared container adapts from mobile through wide screens.",
      },
      {
        id: "visual-language",
        title: "One visual language",
        description:
          "Semantic tokens keep future sections coherent and maintainable.",
      },
      {
        id: "motion",
        title: "Motion with care",
        description:
          "The foundation honors reduced-motion preferences from the start.",
      },
    ],
  },
} satisfies PortfolioMessages;

export default messages;
