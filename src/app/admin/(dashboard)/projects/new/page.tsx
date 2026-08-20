import { ProjectForm } from "../project-form";

export const metadata = {
  title: "New project",
};

export default function AdminNewProjectPage() {
  return (
    <main className="admin-dashboard">
      <h1>New project</h1>
      <ProjectForm />
    </main>
  );
}