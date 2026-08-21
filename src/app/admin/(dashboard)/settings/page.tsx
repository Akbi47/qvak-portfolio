import { getSettingsView } from "./data";
import { SettingsForm } from "./settings-form";
import { AdminFormCard, AdminPage } from "../admin-page";

export const metadata = {
  title: "Admin settings",
};

export default async function AdminSettingsPage() {
  const view = await getSettingsView();

  return (
    <AdminPage title="Settings">
      <AdminFormCard>
        <h2>Site settings</h2>
        <SettingsForm initial={view} />
      </AdminFormCard>
    </AdminPage>
  );
}
