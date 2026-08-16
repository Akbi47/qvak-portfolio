"use client";

interface BackToTopProps {
  label: string;
}

export function BackToTop({ label }: Readonly<BackToTopProps>) {
  function scrollToTop() {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    window.scrollTo({
      behavior: reduceMotion ? "auto" : "smooth",
      top: 0,
    });
  }

  return (
    <button
      aria-label={label}
      className="site-footer__back-to-top"
      onClick={scrollToTop}
      title={label}
      type="button"
    >
      <svg
        aria-hidden="true"
        fill="none"
        height="18"
        viewBox="0 0 24 24"
        width="18"
      >
        <path
          d="M12 19V5m0 0-6 6m6-6 6 6"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    </button>
  );
}
