import { SkillForm } from "../skill-form";

export const metadata = {
  title: "New skill",
};

export default function AdminNewSkillPage() {
  return (
    <main className="admin-dashboard">
      <h1>New skill</h1>
      <SkillForm />
    </main>
  );
}
