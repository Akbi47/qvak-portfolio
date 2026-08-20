import Link from "next/link";

import { listSkills } from "./data";
import { DeleteSkillButton } from "./delete-skill";

export const metadata = {
  title: "Admin skills",
};

export default async function AdminSkillsPage() {
  const skills = await listSkills();

  return (
    <main className="admin-dashboard">
      <div className="admin-page-head">
        <h1>Skills</h1>
        <Link className="admin-button" href="/admin/skills/new">
          New skill
        </Link>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Group</th>
            <th>Order</th>
            <th>Featured</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {skills.map((skill) => (
            <tr key={skill.id}>
              <td>{skill.id}</td>
              <td>{skill.nameEn}</td>
              <td>{skill.group}</td>
              <td>{skill.order}</td>
              <td>{skill.featured ? "✓" : ""}</td>
              <td className="admin-row-actions">
                <Link href={`/admin/skills/${skill.id}`}>Edit</Link>
                <DeleteSkillButton id={skill.id} name={skill.nameEn} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
