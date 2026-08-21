import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/ui/section-heading";
import type {
  ContactContentView,
  SocialPlatform,
} from "@/content/contact";

import { ContactForm } from "./contact-form";
import { SocialGlyphIcon } from "./social-glyph-icon";

interface ContactSectionProps {
  content: ContactContentView;
}

interface LinkGlyphProps {
  className?: string;
}

function DetailLinkGlyph({ className }: Readonly<LinkGlyphProps>) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

const socialPlatformSet = new Set<string>([
  "facebook",
  "github",
  "instagram",
  "linkedin",
  "x",
]);

function DetailIcon({
  className,
  id,
}: Readonly<{ className?: string; id: string }>) {
  return socialPlatformSet.has(id) ? (
    <SocialGlyphIcon platform={id as SocialPlatform} />
  ) : (
    <DetailLinkGlyph className={className} />
  );
}

export function ContactSection({ content }: Readonly<ContactSectionProps>) {
  const nonSocialDetails = content.details.filter(
    (detail) => !socialPlatformSet.has(detail.id),
  );

  return (
    <section
      aria-labelledby="contact-title"
      className="contact-section navigation-anchor"
      id="contact"
    >
      <Container>
        <div className="contact-section__intro">
          <SectionHeading
            align="center"
            description={content.description}
            eyebrow={content.eyebrow}
            title={content.title}
            titleId="contact-title"
          />
        </div>

        <div className="contact-card">
          <div className="contact-layout">
            <div className="contact-info">
              {nonSocialDetails.length > 0 ? (
                <>
                  <h3
                    className="contact-heading"
                    id="contact-details-title"
                  >
                    {content.detailsHeading}
                  </h3>
                  <ul
                    className="contact-info__list"
                    aria-labelledby="contact-details-title"
                  >
                    {nonSocialDetails.map((detail) => (
                      <li className="contact-detail" key={detail.id}>
                        <span className="contact-detail__chip">
                          <DetailIcon
                            className="contact-detail__icon"
                            id={detail.id}
                          />
                        </span>
                        <span className="contact-detail__text">
                          <span className="contact-info__label">
                            {detail.label}
                          </span>
                          {detail.href ? (
                            <a
                              className="contact-detail__value"
                              href={detail.href}
                              rel="noopener noreferrer"
                              target="_blank"
                            >
                              {detail.value}
                            </a>
                          ) : (
                            <span className="contact-detail__value">
                              {detail.value}
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}

              <h4 className="contact-heading" id="contact-socials-title">
                {content.detailsLabel}
              </h4>
              <ul
                aria-labelledby="contact-socials-title"
                className="contact-socials"
              >
                {content.socials.map((social) => {
                  const isConfigured = social.href.startsWith("https://");

                  return (
                    <li key={social.id}>
                      {isConfigured ? (
                        <a
                          aria-label={social.label}
                          className="contact-socials__link"
                          href={social.href}
                          rel="noopener noreferrer"
                          target="_blank"
                          title={social.label}
                        >
                          <SocialGlyphIcon platform={social.id} />
                        </a>
                      ) : (
                        <span
                          aria-disabled="true"
                          className="contact-socials__link contact-socials__link--pending"
                          title={social.label}
                        >
                          <SocialGlyphIcon platform={social.id} />
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="contact-panel">
              <h3 className="contact-heading" id="contact-form-title">
                {content.formHeading}
              </h3>
              <ContactForm content={content} labelledById="contact-form-title" />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
