import { ResumeCategoryForm } from "../../resume-category-form";
import { AdminFormCard, AdminPage } from "../../../admin-page";

export const metadata = {
  title: "New resume category",
};

export default function AdminNewResumeCategoryPage() {
  return (
    <AdminPage backHref="/admin/resume" title="New resume category">
      <AdminFormCard>
        <h2>Category</h2>
        <ResumeCategoryForm />
      </AdminFormCard>
    </AdminPage>
  );
}
