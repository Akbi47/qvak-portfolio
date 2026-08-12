import type { ComponentPropsWithoutRef } from "react";

type PageShellProps = ComponentPropsWithoutRef<"main">;

export function PageShell({ className, ...props }: Readonly<PageShellProps>) {
  const classes = ["page-shell", className].filter(Boolean).join(" ");

  return <main className={classes} {...props} />;
}
