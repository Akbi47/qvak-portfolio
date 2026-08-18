export type SectionPublicity = "private" | "visible";

export interface SiteConfig {
  sections: {
    resume: {
      publicity: SectionPublicity;
    };
  };
}

export const siteConfig: SiteConfig = {
  sections: {
    resume: {
      publicity: "private",
    },
  },
};
