import type { SupabaseClient } from "@supabase/supabase-js";
import { getServerClient } from "./session";

export type MediaBucket = "resume-media" | "project-media" | "portfolio";

export interface StoredObject {
  name: string;
  id: string;
  metadata?: { size?: number };
  created_at?: string;
}

/**
 * Server-side read of a storage bucket's objects for the admin page. Uses the
 * authenticated owner-session server client so Storage RLS (private.is_owner())
 * authorizes the read, matching the accepted #18 design (no service-role on the
 * admin path). The admin page is gated by isAdminUser() at the layout boundary.
 */
export async function listBucketObjects(
  bucket: MediaBucket,
): Promise<StoredObject[]> {
  const client = await getServerClient();

  const { data, error } = await client.storage.from(bucket).list();
  if (error || !data) return [];

  return data as StoredObject[];
}

export function getMediaPublicUrl(bucket: MediaBucket, path: string): string {
  if (bucket === "resume-media") {
    return `/api/resume-media/${encodeURIComponent(path)}`;
  }
  // Public buckets expose a fixed public URL built from the public env URL.
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${bucket}/${encodeURIComponent(path)}`;
}

/**
 * Count how many published CMS media rows reference a stored object. Deletion
 * is blocked while referenced to satisfy Issue #21's reference/orphan criterion.
 * Accepts any Supabase-style client so it is testable against local Supabase.
 */
export async function findMediaReferences(
  client: SupabaseClient,
  bucket: MediaBucket,
  path: string,
): Promise<number> {
  if (bucket === "project-media") {
    const { data, error } = await client
      .from("project_media")
      .select("id")
      .or(`src.ilike.%${path}%`);
    if (!error && data) return data.length;
    return 0;
  }
  if (bucket === "resume-media") {
    const { data, error } = await client
      .from("resume_media")
      .select("id")
      .or(`thumbnail_src.ilike.%${path}%,full_src.ilike.%${path}%`);
    if (!error && data) return data.length;
    return 0;
  }
  return 0;
}