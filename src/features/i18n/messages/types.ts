import type { NavigationSectionId } from "@/features/navigation/config";

export interface LocaleSwitcherMessages {
  label: string;
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

export interface AboutSliderMessages {
  label: string;
  previous: string;
  next: string;
  goToSlide: string;
  portrait: string;
  of: string;
}

export interface PortfolioMessages {
  metadata: {
    title: string;
    description: string;
  };
  localeSwitcher: LocaleSwitcherMessages;
  header: HeaderMessages;
  themeToggle: ThemeToggleMessages;
  aboutSlider: AboutSliderMessages;
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
