import type { ComponentPropsWithoutRef } from "react";

type ContainerSize = "narrow" | "content" | "wide";

interface ContainerProps extends ComponentPropsWithoutRef<"div"> {
  size?: ContainerSize;
}

export function Container({
  className,
  size = "content",
  ...props
}: Readonly<ContainerProps>) {
  const classes = ["container-shell", className].filter(Boolean).join(" ");

  return <div className={classes} data-size={size} {...props} />;
}
