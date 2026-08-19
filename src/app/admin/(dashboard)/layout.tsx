import { redirect } from "next/navigation";

import { isAdminUser } from "@/features/cms/session";

export default async function AdminDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const authenticated = await isAdminUser();

  if (!authenticated) {
    redirect("/admin/login");
  }

  return children;
}
