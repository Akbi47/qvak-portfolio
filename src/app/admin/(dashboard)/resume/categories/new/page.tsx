import { ResumeCategoryForm } from "../../resume-category-form";

export const metadata = {
  title: "New resume category",
};

export default function AdminNewResumeCategoryPage() {
  return (
    <main className="admin-dashboard">
      <h1>New resume category</h1>
      <ResumeCategoryForm />
    </main>
  );
}