import { SkillForm } from "../skill-form";
import { AdminFormCard, AdminPage } from "../../admin-page";

export const metadata = {
  title: "New skill",
};

export default function AdminNewSkillPage() {
  return (
    <AdminPage backHref="/admin/skills" title="New skill">
      <AdminFormCard>
        <h2>Skill details</h2>
        <SkillForm />
      </AdminFormCard>
    </AdminPage>
  );
}
