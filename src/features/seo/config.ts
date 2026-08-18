export const productionSiteUrl = "https://khoawatt.vercel.app";

export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? productionSiteUrl).replace(
    /\/+$/,
    "",
  );
}

export function getAbsoluteUrl(pathname: string): string {
  return `${getSiteUrl()}${pathname === "/" ? "" : pathname}`;
}
