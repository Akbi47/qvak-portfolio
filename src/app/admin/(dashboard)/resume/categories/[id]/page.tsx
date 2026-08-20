import { notFound } from "next/navigation";

import { listResumeCategories } from "../../data";
import { ResumeCategoryForm } from "../../resume-category-form";

interface AdminEditResumeCategoryPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Edit resume category",
};

export default async function AdminEditResumeCategoryPage({
  params,
}: AdminEditResumeCategoryPageProps) {
  const { id } = await params;
  const categories = await listResumeCategories();
  const category = categories.find((item) => item.id === id);

  if (!category) {
    notFound();
  }

  return (
    <main className="admin-dashboard">
      <h1>Edit resume category</h1>
      <ResumeCategoryForm existing={category} />
    </main>
  );
}