import { notFound } from "next/navigation";

import { getSkill } from "../data";
import { SkillForm } from "../skill-form";
import { AdminFormCard, AdminPage } from "../../admin-page";

interface AdminEditSkillPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Edit skill",
};

export default async function AdminEditSkillPage({
  params,
}: AdminEditSkillPageProps) {
  const { id } = await params;
  const skill = await getSkill(id);

  if (!skill) {
    notFound();
  }

  return (
    <AdminPage backHref="/admin/skills" title="Edit skill">
      <AdminFormCard>
        <h2>Skill details</h2>
        <SkillForm existing={skill} />
      </AdminFormCard>
    </AdminPage>
  );
}
