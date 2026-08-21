import { redirect } from "next/navigation";

import { isAdminUser } from "@/features/cms/session";
import { ThemeToggle } from "@/features/theme/theme-toggle";
import { AdminSidebar } from "./admin-sidebar";

const adminThemeMessages = {
  toggle: "Toggle color theme",
  switchToDark: "Switch to dark theme",
  switchToLight: "Switch to light theme",
};

export default async function AdminDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const authenticated = await isAdminUser();

  if (!authenticated) {
    redirect("/admin/login");
  }

  return (
    <div className="admin-shell">
      <AdminSidebar />
      <div className="admin-main">
        <header className="admin-topbar">
          <span className="admin-topbar__title">Content management</span>
          <div className="admin-topbar__actions">
            <ThemeToggle messages={adminThemeMessages} />
            <a className="admin-topbar__view" href="/" target="_blank" rel="noreferrer">
              View site <span aria-hidden="true">↗</span>
            </a>
          </div>
        </header>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
