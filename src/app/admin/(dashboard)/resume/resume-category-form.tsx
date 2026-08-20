"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { AdminResumeCategory } from "./data";
import {
  createResumeCategory,
  updateResumeCategory,
  type ResumeActionResult,
} from "./actions";

interface ResumeCategoryFormProps {
  existing?: AdminResumeCategory;
}

export function ResumeCategoryForm({ existing }: ResumeCategoryFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);

    const data = {
      id: existing?.id ?? String(fd.get("id") ?? ""),
      order: Number(fd.get("order") ?? 0),
      nameEn: String(fd.get("nameEn") ?? ""),
      nameVi: String(fd.get("nameVi") ?? ""),
    };

    startTransition(async () => {
      const result: ResumeActionResult = existing
        ? await updateResumeCategory(data)
        : await createResumeCategory(data);
      if (result.ok) {
        router.push("/admin/resume");
        router.refresh();
      } else {
        setError(result.error ?? "Failed.");
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
        <span>Name (EN)</span>
        <input name="nameEn" required defaultValue={existing?.nameEn ?? ""} />
      </label>
      <label className="admin-field">
        <span>Name (VI)</span>
        <input name="nameVi" required defaultValue={existing?.nameVi ?? ""} />
      </label>
      <label className="admin-field">
        <span>Order</span>
        <input name="order" type="number" defaultValue={existing?.order ?? 0} />
      </label>

      {error ? (
        <p className="admin-error" role="alert">
          {error}
        </p>
      ) : null}

      <button disabled={isPending} type="submit">
        {isPending ? "Saving…" : existing ? "Update category" : "Create category"}
      </button>
    </form>
  );
}