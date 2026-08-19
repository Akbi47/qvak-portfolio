import { LoginForm } from "./login-form";

export const metadata = {
  title: "Admin sign in",
};

export default function AdminLoginPage() {
  return (
    <main className="admin-login">
      <h1>Portfolio admin</h1>
      <p>Sign in to manage content.</p>
      <LoginForm />
    </main>
  );
}
