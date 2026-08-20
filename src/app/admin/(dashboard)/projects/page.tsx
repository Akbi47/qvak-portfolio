import Link from "next/link";

import { listProjects } from "./data";
import { DeleteProjectButton } from "./delete-project";

export const metadata = {
  title: "Admin projects",
};

export default async function AdminProjectsPage() {
  const projects = await listProjects();

  return (
    <main className="admin-dashboard">
      <div className="admin-page-head">
        <h1>Projects</h1>
        <Link className="admin-button" href="/admin/projects/new">
          New project
        </Link>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Featured</th>
            <th>Status</th>
            <th>Order</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id}>
              <td>{project.id}</td>
              <td>{project.titleEn}</td>
              <td>{project.featured ? "✓" : ""}</td>
              <td>{project.status}</td>
              <td>{project.order}</td>
              <td className="admin-row-actions">
                <Link href={`/admin/projects/${project.id}`}>Edit</Link>
                <DeleteProjectButton id={project.id} title={project.titleEn} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}