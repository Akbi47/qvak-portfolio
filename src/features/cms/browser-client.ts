import { createBrowserClient } from "@supabase/ssr";

import { cmsConfig } from "./config";

export function createCmsBrowserClient() {
  return createBrowserClient(cmsConfig.url, cmsConfig.anonKey);
}
