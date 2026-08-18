export type SectionPublicity = "private" | "visible";

export interface SiteConfig {
  sections: {
    resume: {
      publicity: SectionPublicity;
    };
  };
}

export const siteConfig = {
  sections: {
    resume: {
      publicity: "private",
    },
  },
} as const satisfies SiteConfig;