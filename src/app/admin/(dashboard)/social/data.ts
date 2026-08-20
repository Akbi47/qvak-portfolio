import { getServiceClient } from "@/features/cms/server";

export interface AdminSocialLink {
  id: string;
  label: string;
  url: string;
  iconKey: string | null;
  order: number;
}

export async function listSocialLinks(): Promise<AdminSocialLink[]> {
  const client = getServiceClient();
  if (!client) return [];

  const { data, error } = await client
    .from("social_links")
    .select("id, label, url, icon_key, order")
    .order("order")
    .order("id");

  if (error || !data) return [];

  return data.map((link) => ({
    id: link.id,
    label: link.label,
    url: link.url,
    iconKey: link.icon_key,
    order: link.order,
  }));
}
