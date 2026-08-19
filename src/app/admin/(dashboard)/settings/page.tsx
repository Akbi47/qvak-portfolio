import { getSettingsView } from "./data";
import { SettingsForm } from "./settings-form";

export const metadata = {
  title: "Admin settings",
};

export default async function AdminSettingsPage() {
  const view = await getSettingsView();

  return (
    <main className="admin-dashboard">
      <h1>Settings</h1>
      <SettingsForm initial={view} />
    </main>
  );
}
