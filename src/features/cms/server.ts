import { createClient } from "@supabase/supabase-js";

import { cmsConfig, hasCmsConfig } from "./config";

const serviceClient = hasCmsConfig()
  ? createClient(cmsConfig.url, cmsConfig.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

export function getServiceClient() {
  return serviceClient;
}
