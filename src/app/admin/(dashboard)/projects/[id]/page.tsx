import { notFound } from "next/navigation";

import { getProject } from "../data";
import { ProjectForm } from "../project-form";

interface AdminEditProjectPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Edit project",
};

export default async function AdminEditProjectPage({
  params,
}: AdminEditProjectPageProps) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    notFound();
  }

  return (
    <main className="admin-dashboard">
      <h1>Edit project</h1>
      <ProjectForm existing={project} />
    </main>
  );
}