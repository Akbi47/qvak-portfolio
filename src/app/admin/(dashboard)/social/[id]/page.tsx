import { notFound } from "next/navigation";

import { listSocialLinks } from "../data";
import { SocialLinkForm } from "../social-form";
import { AdminFormCard, AdminPage } from "../../admin-page";

interface AdminEditSocialPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Edit social link",
};

export default async function AdminEditSocialPage({
  params,
}: AdminEditSocialPageProps) {
  const { id } = await params;
  const links = await listSocialLinks();
  const link = links.find((item) => item.id === id);

  if (!link) {
    notFound();
  }

  return (
    <AdminPage backHref="/admin/social" title="Edit social link">
      <AdminFormCard>
        <h2>Social link</h2>
        <SocialLinkForm existing={link} />
      </AdminFormCard>
    </AdminPage>
  );
}
