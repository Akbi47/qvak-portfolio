import Link from "next/link";

import { listProjects } from "./data";
import { DeleteProjectButton } from "./delete-project";
import { AdminPage, AdminTable } from "../admin-page";

export const metadata = {
  title: "Admin projects",
};

export default async function AdminProjectsPage() {
  const projects = await listProjects();

  return (
    <AdminPage
      action={
        <Link className="admin-button" href="/admin/projects/new">
          New project
        </Link>
      }
      title="Projects"
    >
      {projects.length === 0 ? (
        <p className="admin-empty">No projects yet.</p>
      ) : (
      <AdminTable label="Projects">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Title</th>
            <th scope="col">Featured</th>
            <th scope="col">Status</th>
            <th scope="col">Published</th>
            <th scope="col">Order</th>
            <th scope="col"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id}>
              <td>{project.id}</td>
              <td>{project.titleEn}</td>
              <td>
                {project.featured ? (
                  <span className="admin-badge admin-badge--success">Featured</span>
                ) : null}
              </td>
              <td>
                <span className={`admin-badge ${project.status === "active" ? "admin-badge--success" : "admin-badge--muted"}`}>
                  {project.status}
                </span>
              </td>
              <td>
                <span className={`admin-badge ${project.published ? "admin-badge--success" : "admin-badge--muted"}`}>
                  {project.published ? "Published" : "Draft"}
                </span>
              </td>
              <td>{project.order}</td>
              <td className="admin-row-actions">
                <Link href={`/admin/projects/${project.id}`}>Edit</Link>
                <DeleteProjectButton id={project.id} title={project.titleEn} />
              </td>
            </tr>
          ))}
        </tbody>
      </AdminTable>
      )}
    </AdminPage>
  );
}
