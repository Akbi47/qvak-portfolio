import { notFound } from "next/navigation";

import { listResumeCategories } from "../../data";
import { ResumeCategoryForm } from "../../resume-category-form";
import { AdminFormCard, AdminPage } from "../../../admin-page";

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
    <AdminPage backHref="/admin/resume" title="Edit resume category">
      <AdminFormCard>
        <h2>Category</h2>
        <ResumeCategoryForm existing={category} />
      </AdminFormCard>
    </AdminPage>
  );
}
