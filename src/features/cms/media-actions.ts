"use server";

import { revalidatePath } from "next/cache";

import { getServiceClient } from "./server";
import { isAdminUser } from "./session";
import type { MediaBucket } from "./media";

export interface MediaUploadResult {
  ok: boolean;
  error?: string;
  path?: string;
  publicUrl?: string;
}

export interface MediaDeleteResult {
  ok: boolean;
  error?: string;
}

function isAllowedMime(mime: string): boolean {
  return ["image/jpeg", "image/png", "image/webp"].includes(mime);
}

function sanitizeFilename(filename: string): string {
  const base = filename.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
  return base.replace(/^-+|-+$/g, "");
}

/**
 * Upload an image to a media bucket. Runs through the server-only service-role
 * path (the browser never holds bucket credentials), but is gated by isAdminUser()
 * so only the owner can trigger uploads. The owner storage RLS also restricts
 * writes on the server-authenticated path; using service-role here is safe because
 * this function is server-only and authorization is enforced at the action boundary.
 */
export async function uploadMedia(
  bucket: MediaBucket,
  file: File,
): Promise<MediaUploadResult> {
  if (!(await isAdminUser())) return { ok: false, error: "Unauthorized." };

  if (!isAllowedMime(file.type)) {
    return { ok: false, error: "Only JPEG, PNG, or WebP images are allowed." };
  }
  if (file.size > 10 * 1024 * 1024) {
    return { ok: false, error: "Image must be 10 MB or smaller." };
  }

  const client = getServiceClient();
  if (!client) return { ok: false, error: "CMS is not configured." };

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const base = sanitizeFilename(file.name.replace(/\.[^.]+$/, ""));
  const path = `${Date.now()}-${base}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error } = await client.storage.from(bucket).upload(path, arrayBuffer, {
    contentType: file.type,
    cacheControl: "3600",
    upsert: false,
  });
  if (error) return { ok: false, error: error.message };

  const publicUrl = bucket === "resume-media"
    ? `/api/resume-media/${encodeURIComponent(path)}`
    : client.storage.from(bucket).getPublicUrl(path).data.publicUrl;

  revalidatePath("/admin/media");
  return { ok: true, path, publicUrl };
}

export async function deleteMedia(
  bucket: MediaBucket,
  path: string,
): Promise<MediaDeleteResult> {
  if (!(await isAdminUser())) return { ok: false, error: "Unauthorized." };

  const client = getServiceClient();
  if (!client) return { ok: false, error: "CMS is not configured." };

  const { error } = await client.storage.from(bucket).remove([path]);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/vi");
  revalidatePath("/admin/media");
  return { ok: true };
}