import Link from "next/link";

import { listResumeCategories, listResumeEntries } from "./data";
import { ResumeDeleteButton } from "./resume-delete";

export const metadata = {
  title: "Admin resume",
};

export default async function AdminResumePage() {
  const categories = await listResumeCategories();
  const entries = await listResumeEntries();

  return (
    <main className="admin-dashboard">
      <h1>Resume / CV</h1>

      <section className="admin-section">
        <div className="admin-page-head">
          <h2>Categories</h2>
          <Link className="admin-button" href="/admin/resume/categories/new">
            New category
          </Link>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Order</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td>{category.id}</td>
                <td>{category.nameEn}</td>
                <td>{category.order}</td>
                <td className="admin-row-actions">
                  <Link href={`/admin/resume/categories/${category.id}`}>Edit</Link>
                  <ResumeDeleteButton id={category.id} label={category.nameEn} kind="category" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="admin-section">
        <div className="admin-page-head">
          <h2>Entries</h2>
          <Link className="admin-button" href="/admin/resume/entries/new">
            New entry
          </Link>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Category</th>
              <th>Draft</th>
              <th>Order</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const category = categories.find((c) => c.id === entry.categoryId);
              return (
                <tr key={entry.id}>
                  <td>{entry.id}</td>
                  <td>{entry.titleEn}</td>
                  <td>{category?.nameEn ?? entry.categoryId}</td>
                  <td>{entry.draft ? "✓" : ""}</td>
                  <td>{entry.order}</td>
                  <td className="admin-row-actions">
                    <Link href={`/admin/resume/entries/${entry.id}`}>Edit</Link>
                    <ResumeDeleteButton id={entry.id} label={entry.titleEn} kind="entry" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </main>
  );
}