import Link from "next/link";

import { listSkills } from "./data";
import { DeleteSkillButton } from "./delete-skill";
import { AdminPage, AdminTable } from "../admin-page";

export const metadata = {
  title: "Admin skills",
};

export default async function AdminSkillsPage() {
  const skills = await listSkills();

  return (
    <AdminPage
      action={
        <Link className="admin-button" href="/admin/skills/new">
          New skill
        </Link>
      }
      title="Skills"
    >
      {skills.length === 0 ? (
        <p className="admin-empty">No skills yet.</p>
      ) : (
      <AdminTable label="Skills">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Name</th>
            <th scope="col">Group</th>
            <th scope="col">Order</th>
            <th scope="col">Featured</th>
            <th scope="col"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {skills.map((skill) => (
            <tr key={skill.id}>
              <td>{skill.id}</td>
              <td>{skill.nameEn}</td>
              <td>{skill.group}</td>
              <td>{skill.order}</td>
              <td>
                {skill.featured ? (
                  <span className="admin-badge admin-badge--success">Featured</span>
                ) : null}
              </td>
              <td className="admin-row-actions">
                <Link href={`/admin/skills/${skill.id}`}>Edit</Link>
                <DeleteSkillButton id={skill.id} name={skill.nameEn} />
              </td>
            </tr>
          ))}
        </tbody>
      </AdminTable>
      )}
    </AdminPage>
  );
}
