export const navigationSectionIds = [
  "home",
  "about",
  "skills",
  "projects",
  "resume",
  "contact",
] as const;

export type NavigationSectionId = (typeof navigationSectionIds)[number];
