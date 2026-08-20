import Link from "next/link";

import { listSocialLinks } from "./data";
import { DeleteSocialButton } from "./delete-social";

export const metadata = {
  title: "Admin social links",
};

export default async function AdminSocialPage() {
  const links = await listSocialLinks();

  return (
    <main className="admin-dashboard">
      <div className="admin-page-head">
        <h1>Social links</h1>
        <Link className="admin-button" href="/admin/social/new">
          New link
        </Link>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Label</th>
            <th>URL</th>
            <th>Order</th>
            <th />
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
      </table>
    </main>
  );
}
