"use client";

import { usePathname, useRouter } from "next/navigation";
import type { MouseEvent } from "react";

import { type Locale } from "@/features/i18n/config";
import type { LocaleSwitcherMessages } from "@/features/i18n/messages/types";
import { getLocalizedPathname } from "@/features/i18n/routing";

interface LocaleSwitcherProps {
  locale: Locale;
  messages: LocaleSwitcherMessages;
  onNavigate?: () => void;
}

export function LocaleSwitcher({
  locale,
  messages,
  onNavigate,
}: Readonly<LocaleSwitcherProps>) {
  const pathname = usePathname();
  const router = useRouter();

  function preserveLocationDetails(
    event: MouseEvent<HTMLAnchorElement>,
    targetLocale: Locale,
  ) {
    event.preventDefault();
    onNavigate?.();

    const localizedPathname = getLocalizedPathname(pathname, targetLocale);
    router.replace(
      `${localizedPathname}${window.location.search}${window.location.hash}`,
      { scroll: false },
    );
  }

  const options = [
    { locale: "en" as const, label: messages.english },
    { locale: "vi" as const, label: messages.vietnamese },
  ];

  return (
    <nav aria-label={messages.label} className="locale-switcher">
      {options.map((option) => (
        <a
          aria-current={locale === option.locale ? "page" : undefined}
          href={getLocalizedPathname(pathname, option.locale)}
          hrefLang={option.locale}
          key={option.locale}
          lang={option.locale}
          onClick={(event) => preserveLocationDetails(event, option.locale)}
        >
          {option.label}
        </a>
      ))}
    </nav>
  );
}
