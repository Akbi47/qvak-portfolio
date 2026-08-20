import { emptyProfileView, getProfileView } from "./data";
import { ProfileForm } from "./profile-form";

export const metadata = {
  title: "Admin profile",
};

export default async function AdminProfilePage() {
  const profile = (await getProfileView()) ?? emptyProfileView();

  return (
    <main className="admin-dashboard">
      <h1>Profile</h1>
      <ProfileForm initial={profile} />
    </main>
  );
}
