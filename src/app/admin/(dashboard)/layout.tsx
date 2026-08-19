import Link from "next/link";
import { redirect } from "next/navigation";

import { isAdminUser } from "@/features/cms/session";

const navLinks = [
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/skills", label: "Skills" },
] as const;

export default async function AdminDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const authenticated = await isAdminUser();

  if (!authenticated) {
    redirect("/admin/login");
  }

  return (
    <>
      <nav className="admin-nav" aria-label="Admin">
        {navLinks.map((link) => (
          <Link href={link.href} key={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
      {children}
    </>
  );
}
