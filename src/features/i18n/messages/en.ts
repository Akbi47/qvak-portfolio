import type { PortfolioMessages } from "@/features/i18n/messages/types";

const messages = {
  metadata: {
    title: "Quach Vo Anh Khoa",
    description: "Portfolio foundation for Quach Vo Anh Khoa.",
  },
  localeSwitcher: {
    label: "Change language",
    currentLanguage: "Current language",
    english: "English",
    vietnamese: "Tiếng Việt",
  },
  header: {
    primaryNavigation: "Portfolio sections",
    homeAction: "Go to Home",
    openMenu: "Open navigation menu",
    closeMenu: "Close navigation menu",
    github: "Open GitHub profile",
    sections: {
      home: "Home",
      about: "About",
      skills: "Skills",
      projects: "Projects",
      resume: "Resume",
      contact: "Contact",
    },
  },
  themeToggle: {
    toggle: "Toggle color theme",
    switchToLight: "Switch to light theme",
    switchToDark: "Switch to dark theme",
  },
  notFound: {
    eyebrow: "404",
    title: "This page could not be found",
    description:
      "The page you are looking for may have moved or no longer exists.",
    homeAction: "Back to Home",
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
