import { notFound } from "next/navigation";

import { getResumeEntry, listResumeCategories } from "../../data";
import { ResumeEntryForm } from "../../resume-entry-form";

interface AdminEditResumeEntryPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Edit resume entry",
};

export default async function AdminEditResumeEntryPage({
  params,
}: AdminEditResumeEntryPageProps) {
  const { id } = await params;
  const [entry, categories] = await Promise.all([
    getResumeEntry(id),
    listResumeCategories(),
  ]);

  if (!entry) {
    notFound();
  }

  return (
    <main className="admin-dashboard">
      <h1>Edit resume entry</h1>
      <ResumeEntryForm existing={entry} categories={categories} />
    </main>
  );
}