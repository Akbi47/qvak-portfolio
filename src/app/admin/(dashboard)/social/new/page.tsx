import { SocialLinkForm } from "../social-form";
import { AdminFormCard, AdminPage } from "../../admin-page";

export const metadata = {
  title: "New social link",
};

export default function AdminNewSocialPage() {
  return (
    <AdminPage backHref="/admin/social" title="New social link">
      <AdminFormCard>
        <h2>Social link</h2>
        <SocialLinkForm />
      </AdminFormCard>
    </AdminPage>
  );
}
