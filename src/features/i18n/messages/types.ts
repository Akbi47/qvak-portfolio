import type { NavigationSectionId } from "@/features/navigation/config";

export interface LocaleSwitcherMessages {
  label: string;
  currentLanguage: string;
  english: string;
  vietnamese: string;
}

export interface HeaderMessages {
  primaryNavigation: string;
  homeAction: string;
  openMenu: string;
  closeMenu: string;
  github: string;
  sections: Record<NavigationSectionId, string>;
}

export interface ThemeToggleMessages {
  toggle: string;
  switchToLight: string;
  switchToDark: string;
}

export interface PortfolioMessages {
  metadata: {
    title: string;
    description: string;
  };
  localeSwitcher: LocaleSwitcherMessages;
  header: HeaderMessages;
  themeToggle: ThemeToggleMessages;
  notFound: {
    eyebrow: string;
    title: string;
    description: string;
    homeAction: string;
  };
  foundation: {
    eyebrow: string;
    title: string;
    description: string;
    items: ReadonlyArray<{
      id: string;
      title: string;
      description: string;
    }>;
  };
}
