import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/ui/section-heading";
import type { ResumeLockContentView } from "@/content/resume";

interface ResumeSectionLockProps {
  content: ResumeLockContentView;
}

export function ResumeSectionLock({
  content,
}: Readonly<ResumeSectionLockProps>) {
  return (
    <section
      aria-labelledby="resume-title"
      className="resume-section navigation-anchor"
      id="resume"
    >
      <Container>
        <div className="resume-section__intro">
          <SectionHeading
            description={content.description}
            eyebrow={content.eyebrow}
            title={content.title}
            titleId="resume-title"
          />
        </div>

        <div
          aria-labelledby="resume-lock-title"
          className="resume-lock"
          role="region"
        >
          <span aria-hidden="true" className="resume-lock__icon">
            <svg
              aria-hidden="true"
              fill="none"
              height="40"
              viewBox="0 0 24 24"
              width="40"
            >
              <path
                d="M6 10h12v10H6z"
                stroke="currentColor"
                strokeLinejoin="round"
                strokeWidth="1.6"
              />
              <path
                d="M9 10V7a3 3 0 0 1 6 0v3"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.6"
              />
            </svg>
          </span>
          <h3 className="resume-lock__title" id="resume-lock-title">
            {content.privateTitle}
          </h3>
          <p className="resume-lock__message">{content.privateMessage}</p>
        </div>
      </Container>
    </section>
  );
}