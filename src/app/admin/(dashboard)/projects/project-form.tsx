"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { AdminProjectRow } from "./data";
import {
  createProject,
  updateProject,
  type ProjectActionResult,
} from "./actions";

interface ProjectFormProps {
  existing?: AdminProjectRow;
}

export function ProjectForm({ existing }: ProjectFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);

    const data = {
      id: existing?.id ?? String(fd.get("id") ?? ""),
      slug: String(fd.get("slug") ?? ""),
      techStack: String(fd.get("techStack") ?? ""),
      liveDemoUrl: String(fd.get("liveDemoUrl") ?? ""),
      codeUrl: String(fd.get("codeUrl") ?? ""),
      featured: fd.get("featured") === "on",
      order: Number(fd.get("order") ?? 0),
      status: String(fd.get("status") ?? "active"),
      published: fd.get("published") === "on",
      titleEn: String(fd.get("titleEn") ?? ""),
      titleVi: String(fd.get("titleVi") ?? ""),
      categoryEn: String(fd.get("categoryEn") ?? ""),
      categoryVi: String(fd.get("categoryVi") ?? ""),
      summaryEn: String(fd.get("summaryEn") ?? ""),
      summaryVi: String(fd.get("summaryVi") ?? ""),
      descriptionEn: String(fd.get("descriptionEn") ?? ""),
      descriptionVi: String(fd.get("descriptionVi") ?? ""),
    };

    startTransition(async () => {
      const result: ProjectActionResult = existing
        ? await updateProject(data)
        : await createProject(data);
      if (result.ok) {
        router.push("/admin/projects");
        router.refresh();
      } else {
        setError(
          result.fieldErrors
            ? Object.values(result.fieldErrors).join(" ")
            : result.error ?? "Failed.",
        );
      }
    });
  }

  return (
    <form className="admin-form" onSubmit={onSubmit}>
      {!existing ? (
        <label className="admin-field">
          <span>ID (slug, optional)</span>
          <input name="id" defaultValue="" />
        </label>
      ) : null}

      <label className="admin-field">
        <span>Slug</span>
        <input name="slug" required defaultValue={existing?.slug ?? ""} />
      </label>

      <h3>Title</h3>
      <label className="admin-field">
        <span>Title (EN)</span>
        <input name="titleEn" required defaultValue={existing?.titleEn ?? ""} />
      </label>
      <label className="admin-field">
        <span>Title (VI)</span>
        <input name="titleVi" required defaultValue={existing?.titleVi ?? ""} />
      </label>

      <h3>Category</h3>
      <label className="admin-field">
        <span>Category (EN)</span>
        <input name="categoryEn" required defaultValue={existing?.categoryEn ?? ""} />
      </label>
      <label className="admin-field">
        <span>Category (VI)</span>
        <input name="categoryVi" required defaultValue={existing?.categoryVi ?? ""} />
      </label>

      <h3>Summary</h3>
      <label className="admin-field">
        <span>Summary (EN)</span>
        <textarea name="summaryEn" required rows={3} defaultValue={existing?.summaryEn ?? ""} />
      </label>
      <label className="admin-field">
        <span>Summary (VI)</span>
        <textarea name="summaryVi" required rows={3} defaultValue={existing?.summaryVi ?? ""} />
      </label>

      <h3>Description (optional)</h3>
      <label className="admin-field">
        <span>Description (EN)</span>
        <textarea name="descriptionEn" rows={4} defaultValue={existing?.descriptionEn ?? ""} />
      </label>
      <label className="admin-field">
        <span>Description (VI)</span>
        <textarea name="descriptionVi" rows={4} defaultValue={existing?.descriptionVi ?? ""} />
      </label>

      <h3>Details</h3>
      <label className="admin-field">
        <span>Tech stack (comma-separated)</span>
        <input name="techStack" defaultValue={existing?.techStack.join(", ") ?? ""} />
      </label>
      <label className="admin-field">
        <span>Live Demo URL (http/https)</span>
        <input name="liveDemoUrl" defaultValue={existing?.liveDemoUrl ?? ""} />
      </label>
      <label className="admin-field">
        <span>Code URL (http/https)</span>
        <input name="codeUrl" defaultValue={existing?.codeUrl ?? ""} />
      </label>
      <label className="admin-field">
        <span>Order</span>
        <input name="order" type="number" defaultValue={existing?.order ?? 0} />
      </label>
      <label className="admin-field">
        <span>Status</span>
        <select name="status" defaultValue={existing?.status ?? "active"}>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
          <option value="private">Private</option>
        </select>
      </label>

      <label className="admin-check">
        <input name="featured" type="checkbox" defaultChecked={existing?.featured} />
        <span>Featured</span>
      </label>
      <label className="admin-check">
        <input name="published" type="checkbox" defaultChecked={existing?.published} />
        <span>Published</span>
      </label>

      {error ? (
        <p className="admin-error" role="alert">
          {error}
        </p>
      ) : null}

      <button disabled={isPending} type="submit">
        {isPending ? "Saving…" : existing ? "Update project" : "Create project"}
      </button>
    </form>
  );
}