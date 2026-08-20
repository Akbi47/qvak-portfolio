import { notFound } from "next/navigation";

import { listSocialLinks } from "../data";
import { SocialLinkForm } from "../social-form";

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
    <main className="admin-dashboard">
      <h1>Edit social link</h1>
      <SocialLinkForm existing={link} />
    </main>
  );
}
