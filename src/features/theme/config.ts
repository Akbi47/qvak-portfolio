export const themes = ["light", "dark"] as const;

export type Theme = (typeof themes)[number];

export const themeStorageKey = "qvak.theme";

export function isTheme(value: string | null): value is Theme {
  return themes.some((theme) => theme === value);
}
