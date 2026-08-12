"use client";

import type { ThemeToggleMessages } from "@/features/i18n/messages/types";
import { useTheme } from "@/features/theme/theme-provider";

interface ThemeToggleProps {
  messages: ThemeToggleMessages;
}

export function ThemeToggle({ messages }: Readonly<ThemeToggleProps>) {
  const { theme, toggleTheme } = useTheme();
  const label =
    theme === "dark"
      ? messages.switchToLight
      : theme === "light"
        ? messages.switchToDark
        : messages.toggle;

  return (
    <button
      aria-label={label}
      aria-pressed={theme === null ? undefined : theme === "dark"}
      className="theme-toggle"
      onClick={toggleTheme}
      title={label}
      type="button"
    >
      <svg
        aria-hidden="true"
        className="theme-toggle__icon theme-toggle__icon--light"
        fill="none"
        height="18"
        viewBox="0 0 24 24"
        width="18"
      >
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
        <path
          d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2"
        />
      </svg>
      <svg
        aria-hidden="true"
        className="theme-toggle__icon theme-toggle__icon--dark"
        fill="none"
        height="18"
        viewBox="0 0 24 24"
        width="18"
      >
        <path
          d="M20.4 15.2A8.5 8.5 0 0 1 8.8 3.6 8.5 8.5 0 1 0 20.4 15.2Z"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    </button>
  );
}
