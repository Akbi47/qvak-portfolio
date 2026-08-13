"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  type MouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";

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
  const [open, setOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        setOpen(false);
        triggerRef.current?.focus({ preventScroll: true });
      }
    }

    function closeOutside(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !switcherRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", closeOnEscape, true);
    document.addEventListener("pointerdown", closeOutside);

    return () => {
      document.removeEventListener("keydown", closeOnEscape, true);
      document.removeEventListener("pointerdown", closeOutside);
    };
  }, [open]);

  function preserveLocationDetails(
    event: MouseEvent<HTMLAnchorElement>,
    targetLocale: Locale,
  ) {
    event.preventDefault();
    setOpen(false);
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
  const currentLanguage =
    locale === "en" ? messages.english : messages.vietnamese;

  return (
    <div className="locale-switcher" ref={switcherRef}>
      <button
        aria-controls="locale-options"
        aria-expanded={open}
        aria-label={`${messages.label}. ${messages.currentLanguage}: ${currentLanguage}`}
        className="locale-switcher__trigger"
        onClick={() => setOpen((current) => !current)}
        ref={triggerRef}
        title={`${messages.currentLanguage}: ${currentLanguage}`}
        type="button"
      >
        <svg
          aria-hidden="true"
          fill="none"
          height="19"
          viewBox="0 0 24 24"
          width="19"
        >
          <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M3.8 12h16.4M12 3.5c2 2.2 3 5 3 8.5s-1 6.3-3 8.5c-2-2.2-3-5-3-8.5s1-6.3 3-8.5Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      </button>

      <nav
        aria-label={messages.label}
        className="locale-switcher__popover"
        data-open={open ? "true" : "false"}
        id="locale-options"
      >
        {options.map((option) => (
          <a
            aria-current={locale === option.locale ? "page" : undefined}
            href={getLocalizedPathname(pathname, option.locale)}
            hrefLang={option.locale}
            key={option.locale}
            lang={option.locale}
            onClick={(event) => preserveLocationDetails(event, option.locale)}
          >
            <span>{option.locale.toUpperCase()}</span>
            {locale === option.locale ? (
              <svg
                aria-hidden="true"
                fill="none"
                height="16"
                viewBox="0 0 20 20"
                width="16"
              >
                <path
                  d="m5 10 3 3 7-7"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            ) : null}
          </a>
        ))}
      </nav>
    </div>
  );
}
