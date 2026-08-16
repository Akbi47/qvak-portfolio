import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/ui/section-heading";
import type { ContactContentView } from "@/content/contact";

import { ContactForm } from "./contact-form";

interface ContactSectionProps {
  content: ContactContentView;
}

export function ContactSection({ content }: Readonly<ContactSectionProps>) {
  return (
    <section
      aria-labelledby="contact-title"
      className="contact-section navigation-anchor"
      id="contact"
    >
      <Container>
        <div className="contact-section__intro">
          <SectionHeading
            description={content.description}
            eyebrow={content.eyebrow}
            title={content.title}
            titleId="contact-title"
          />
        </div>

        <div className="contact-layout">
          <aside className="contact-info" aria-label={content.detailsLabel}>
            <div className="contact-info__card">
              <h3 className="contact-info__heading">{content.detailsLabel}</h3>
              <ul className="contact-info__list">
                {content.details.map((detail) => (
                  <li key={detail.id}>
                    <a
                      className="contact-info__link"
                      href={detail.href}
                      rel="noopener noreferrer"
                      target={detail.href ? "_blank" : undefined}
                    >
                      <span className="contact-info__label">
                        {detail.label}
                      </span>
                      <span className="contact-info__value">
                        {detail.value}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="contact-panel">
            <ContactForm content={content} />
          </div>
        </div>
      </Container>
    </section>
  );
}
