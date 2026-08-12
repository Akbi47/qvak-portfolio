import type { ComponentPropsWithoutRef } from "react";

import { Container } from "@/components/layout/container";

type ContainerSize = "narrow" | "content" | "wide";
type SectionSurface = "default" | "subtle" | "elevated";

interface SectionProps extends ComponentPropsWithoutRef<"section"> {
  containerSize?: ContainerSize;
  surface?: SectionSurface;
}

export function Section({
  children,
  className,
  containerSize = "content",
  surface = "default",
  ...props
}: Readonly<SectionProps>) {
  const classes = ["section-shell", className].filter(Boolean).join(" ");

  return (
    <section className={classes} data-surface={surface} {...props}>
      <Container size={containerSize}>{children}</Container>
    </section>
  );
}
