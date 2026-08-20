import { listResumeCategories } from "../../data";
import { ResumeEntryForm } from "../../resume-entry-form";

export const metadata = {
  title: "New resume entry",
};

export default async function AdminNewResumeEntryPage() {
  const categories = await listResumeCategories();

  return (
    <main className="admin-dashboard">
      <h1>New resume entry</h1>
      <ResumeEntryForm categories={categories} />
    </main>
  );
}