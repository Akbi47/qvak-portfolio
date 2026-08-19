export const cmsConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
} as const;

export function hasCmsConfig(): boolean {
  return (
    cmsConfig.url !== "" &&
    cmsConfig.anonKey !== "" &&
    cmsConfig.serviceRoleKey !== ""
  );
}
