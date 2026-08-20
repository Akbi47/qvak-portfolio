import { getProfileView } from "./data";
import { ProfileForm } from "./profile-form";

export const metadata = {
  title: "Admin profile",
};

export default async function AdminProfilePage() {
  const profile = await getProfileView();

  return (
    <main className="admin-dashboard">
      <h1>Profile</h1>
      {profile ? (
        <ProfileForm initial={profile} />
      ) : (
        <p className="admin-message">No profile record found. Run the backfill script first.</p>
      )}
    </main>
  );
}
