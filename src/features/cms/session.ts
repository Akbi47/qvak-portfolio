import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { cmsConfig, hasCmsConfig } from "./config";

export async function getServerClient() {
  const cookieStore = await cookies();

  return createServerClient(cmsConfig.url, cmsConfig.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component; safe to ignore when cookies are
          // read-only (e.g. during render). Mutations use server actions.
        }
      },
    },
  });
}

export async function isAdminUser(): Promise<boolean> {
  if (!hasCmsConfig()) {
    return false;
  }

  const supabase = await getServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data: owner } = await supabase
    .from("admin_owner")
    .select("id")
    .maybeSingle();

  return owner !== null;
}
