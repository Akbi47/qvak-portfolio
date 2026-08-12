export interface LocaleSwitcherMessages {
  label: string;
  english: string;
  vietnamese: string;
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
  themeToggle: ThemeToggleMessages;
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
