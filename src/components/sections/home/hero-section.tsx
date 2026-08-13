import Image from "next/image";

import { Section } from "@/components/layout/section";
import type { PortfolioProfileView } from "@/content/profile";

interface HeroSectionProps {
  profile: PortfolioProfileView;
}

export function HeroSection({ profile }: Readonly<HeroSectionProps>) {
  return (
    <Section
      aria-labelledby="home-title"
      className="home-hero navigation-anchor"
      containerSize="wide"
      id="home"
    >
      <div className="home-hero__layout">
        <div className="home-hero__content">
          <p className="home-hero__eyebrow">{profile.hero.eyebrow}</p>
          <h1 className="home-hero__title" id="home-title">
            {profile.hero.title}
          </h1>
          <p className="home-hero__identity">
            <strong>{profile.name}</strong>
            <span aria-hidden="true">/</span>
            {profile.role}
          </p>
          <p className="home-hero__description">{profile.hero.description}</p>
          <a className="home-hero__action" href="#about">
            {profile.hero.aboutAction}
            <svg
              aria-hidden="true"
              fill="none"
              height="18"
              viewBox="0 0 24 24"
              width="18"
            >
              <path
                d="m7 10 5 5 5-5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </a>
        </div>

        <div className="home-hero__visual">
          <div className="home-hero__frame-bar" aria-hidden="true">
            <span />
            <span />
            <span />
            <code>portfolio.tsx</code>
          </div>
          <div className="home-hero__image-wrap">
            <Image
              alt={profile.hero.image.alt}
              className="home-hero__image"
              height={profile.hero.image.height}
              preload
              sizes="(min-width: 64rem) 42vw, (min-width: 48rem) 68vw, calc(100vw - 2rem)"
              src={profile.hero.image.src}
              style={{ objectPosition: profile.hero.image.focalPoint }}
              width={profile.hero.image.width}
            />
            <div className="home-hero__image-overlay" aria-hidden="true" />
          </div>
        </div>
      </div>
    </Section>
  );
}
