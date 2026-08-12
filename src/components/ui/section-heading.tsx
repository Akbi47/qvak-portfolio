import type { ReactNode } from "react";

type HeadingAlign = "start" | "center";
type HeadingLevel = "h1" | "h2" | "h3";

interface SectionHeadingProps {
  align?: HeadingAlign;
  description?: ReactNode;
  eyebrow?: ReactNode;
  level?: HeadingLevel;
  title: ReactNode;
  titleId?: string;
}

export function SectionHeading({
  align = "start",
  description,
  eyebrow,
  level = "h2",
  title,
  titleId,
}: Readonly<SectionHeadingProps>) {
  const Heading = level;

  return (
    <header className="section-heading" data-align={align}>
      {eyebrow ? <p className="section-heading__eyebrow">{eyebrow}</p> : null}
      <Heading className="section-heading__title" id={titleId}>
        {title}
      </Heading>
      {description ? (
        <p className="section-heading__description">{description}</p>
      ) : null}
    </header>
  );
}
