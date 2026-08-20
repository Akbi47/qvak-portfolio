import { getServiceClient } from "./server";

export type MediaBucket = "resume-media" | "project-media" | "portfolio";

export interface StoredObject {
  name: string;
  id: string;
  metadata?: { size?: number };
  created_at?: string;
}

/**
 * Server-side read of a storage bucket's objects. Uses the server-only
 * service-role path (the public/admin read of bucket lists is not needed by the
 * browser, and owner RLS would restrict it anyway). Callers (admin pages) are
 * expected to gate on isAdminUser() at the route/page boundary.
 */
export async function listBucketObjects(
  bucket: MediaBucket,
): Promise<StoredObject[]> {
  const client = getServiceClient();
  if (!client) return [];

  const { data, error } = await client.storage.from(bucket).list();
  if (error || !data) return [];

  return data as StoredObject[];
}

export function getMediaPublicUrl(bucket: MediaBucket, path: string): string {
  if (bucket === "resume-media") {
    return `/api/resume-media/${encodeURIComponent(path)}`;
  }
  const client = getServiceClient();
  if (!client) return "";
  return client.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}