export const productionSiteUrl = "https://quachvoanhkhoa.feaon.com";

export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? productionSiteUrl).replace(
    /\/+$/,
    "",
  );
}

export function getAbsoluteUrl(pathname: string): string {
  return `${getSiteUrl()}${pathname === "/" ? "" : pathname}`;
}
