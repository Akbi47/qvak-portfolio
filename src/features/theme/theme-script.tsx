import { themeStorageKey } from "@/features/theme/config";

const themeInitializationScript = `
  try {
    var storedTheme = localStorage.getItem(${JSON.stringify(themeStorageKey)});
    var resolvedTheme = storedTheme === "light" || storedTheme === "dark"
      ? storedTheme
      : (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.dataset.theme = resolvedTheme;
  } catch (error) {
    document.documentElement.dataset.theme = matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
`;

export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: themeInitializationScript }}
      id="theme-initializer"
    />
  );
}
