import { LoginForm } from "./login-form";
import { ThemeToggle } from "@/features/theme/theme-toggle";

const adminThemeMessages = {
  toggle: "Toggle color theme",
  switchToDark: "Switch to dark theme",
  switchToLight: "Switch to light theme",
};

export const metadata = {
  title: "Admin sign in",
};

export default function AdminLoginPage() {
  return (
    <main className="admin-login-shell">
      <div className="admin-login-theme">
        <ThemeToggle messages={adminThemeMessages} />
      </div>
      <section className="admin-login" aria-labelledby="admin-login-title">
        <div className="admin-brand admin-login__brand">
          <span className="admin-brand__mark" aria-hidden="true">Q</span>
          <span className="admin-brand__name">Khoa Watt</span>
        </div>
        <div className="admin-login__heading">
          <h1 id="admin-login-title">Portfolio admin</h1>
          <p>Sign in to manage your portfolio content.</p>
        </div>
        <LoginForm />
      </section>
    </main>
  );
}
