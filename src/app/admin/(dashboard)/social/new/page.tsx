import { SocialLinkForm } from "../social-form";

export const metadata = {
  title: "New social link",
};

export default function AdminNewSocialPage() {
  return (
    <main className="admin-dashboard">
      <h1>New social link</h1>
      <SocialLinkForm />
    </main>
  );
}
