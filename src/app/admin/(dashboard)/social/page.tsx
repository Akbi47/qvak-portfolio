import Link from "next/link";

import { listSocialLinks } from "./data";
import { DeleteSocialButton } from "./delete-social";
import { AdminPage, AdminTable } from "../admin-page";

export const metadata = {
  title: "Admin social links",
};

export default async function AdminSocialPage() {
  const links = await listSocialLinks();

  return (
    <AdminPage
      action={
        <Link className="admin-button" href="/admin/social/new">
          New link
        </Link>
      }
      title="Social links"
    >
      {links.length === 0 ? (
        <p className="admin-empty">No social links yet.</p>
      ) : (
      <AdminTable label="Social links">
        <thead>
          <tr>
            <th scope="col">Label</th>
            <th scope="col">URL</th>
            <th scope="col">Order</th>
            <th scope="col"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {links.map((link) => (
            <tr key={link.id}>
              <td>{link.label}</td>
              <td>{link.url}</td>
              <td>{link.order}</td>
              <td className="admin-row-actions">
                <Link href={`/admin/social/${link.id}`}>Edit</Link>
                <DeleteSocialButton id={link.id} label={link.label} />
              </td>
            </tr>
          ))}
        </tbody>
      </AdminTable>
      )}
    </AdminPage>
  );
}
