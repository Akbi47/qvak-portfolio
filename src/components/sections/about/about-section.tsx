import { Section } from "@/components/layout/section";
import { PortraitSlider } from "@/components/sections/about/portrait-slider";
import type { PortfolioProfileView } from "@/content/profile";
import type { AboutSliderMessages } from "@/features/i18n/messages/types";

interface AboutSectionProps {
  messages: AboutSliderMessages;
  profile: PortfolioProfileView;
}

export function AboutSection({
  messages,
  profile,
}: Readonly<AboutSectionProps>) {
  return (
    <Section
      aria-labelledby="about-title"
      className="about-section navigation-anchor"
      containerSize="wide"
      id="about"
    >
      <div className="about-section__layout">
        <div className="about-section__content">
          <p className="about-section__eyebrow">{profile.about.eyebrow}</p>
          <h2 className="about-section__title" id="about-title">
            {profile.about.heading}
          </h2>
          <p className="about-section__intro">{profile.about.intro}</p>
          <p className="about-section__description">
            {profile.about.description}
          </p>
          <div className="about-section__signature" aria-hidden="true">
            <span />
            {profile.shortName}
          </div>
        </div>

        <div className="about-section__visual">
          <PortraitSlider
            messages={messages}
            portraits={profile.about.portraits}
          />
        </div>
      </div>
    </Section>
  );
}
