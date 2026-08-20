import { notFound } from "next/navigation";

import { getSkill } from "../data";
import { SkillForm } from "../skill-form";

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
    <main className="admin-dashboard">
      <h1>Edit skill</h1>
      <SkillForm existing={skill} />
    </main>
  );
}
