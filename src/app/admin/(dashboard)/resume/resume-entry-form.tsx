"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { AdminResumeCategory, AdminResumeEntry } from "./data";
import {
  createResumeEntry,
  updateResumeEntry,
  type ResumeActionResult,
} from "./actions";

interface ResumeEntryFormProps {
  existing?: AdminResumeEntry;
  categories: AdminResumeCategory[];
}

export function ResumeEntryForm({ existing, categories }: ResumeEntryFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);

    const data = {
      id: existing?.id ?? String(fd.get("id") ?? ""),
      categoryId: String(fd.get("categoryId") ?? ""),
      startDate: String(fd.get("startDate") ?? ""),
      endDate: String(fd.get("endDate") ?? ""),
      order: Number(fd.get("order") ?? 0),
      draft: fd.get("draft") === "on",
      titleEn: String(fd.get("titleEn") ?? ""),
      titleVi: String(fd.get("titleVi") ?? ""),
      organizationEn: String(fd.get("organizationEn") ?? ""),
      organizationVi: String(fd.get("organizationVi") ?? ""),
      locationEn: String(fd.get("locationEn") ?? ""),
      locationVi: String(fd.get("locationVi") ?? ""),
      dateLabelEn: String(fd.get("dateLabelEn") ?? ""),
      dateLabelVi: String(fd.get("dateLabelVi") ?? ""),
      summaryEn: String(fd.get("summaryEn") ?? ""),
      summaryVi: String(fd.get("summaryVi") ?? ""),
      highlightsEn: String(fd.get("highlightsEn") ?? ""),
      highlightsVi: String(fd.get("highlightsVi") ?? ""),
      tagsEn: String(fd.get("tagsEn") ?? ""),
      tagsVi: String(fd.get("tagsVi") ?? ""),
    };

    startTransition(async () => {
      const result: ResumeActionResult = existing
        ? await updateResumeEntry(data)
        : await createResumeEntry(data);
      if (result.ok) {
        router.push("/admin/resume");
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
        <span>Category</span>
        <select name="categoryId" required defaultValue={existing?.categoryId ?? ""}>
          <option value="">Select…</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.nameEn}
            </option>
          ))}
        </select>
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

      <h3>Organization</h3>
      <label className="admin-field">
        <span>Organization (EN)</span>
        <input name="organizationEn" defaultValue={existing?.organizationEn ?? ""} />
      </label>
      <label className="admin-field">
        <span>Organization (VI)</span>
        <input name="organizationVi" defaultValue={existing?.organizationVi ?? ""} />
      </label>

      <h3>Location</h3>
      <label className="admin-field">
        <span>Location (EN)</span>
        <input name="locationEn" defaultValue={existing?.locationEn ?? ""} />
      </label>
      <label className="admin-field">
        <span>Location (VI)</span>
        <input name="locationVi" defaultValue={existing?.locationVi ?? ""} />
      </label>

      <h3>Date</h3>
      <label className="admin-field">
        <span>Start date</span>
        <input name="startDate" type="date" defaultValue={existing?.startDate ?? ""} />
      </label>
      <label className="admin-field">
        <span>End date</span>
        <input name="endDate" type="date" defaultValue={existing?.endDate ?? ""} />
      </label>
      <label className="admin-field">
        <span>Date label (EN)</span>
        <input name="dateLabelEn" defaultValue={existing?.dateLabelEn ?? ""} />
      </label>
      <label className="admin-field">
        <span>Date label (VI)</span>
        <input name="dateLabelVi" defaultValue={existing?.dateLabelVi ?? ""} />
      </label>

      <h3>Summary</h3>
      <label className="admin-field">
        <span>Summary (EN)</span>
        <textarea name="summaryEn" rows={3} defaultValue={existing?.summaryEn ?? ""} />
      </label>
      <label className="admin-field">
        <span>Summary (VI)</span>
        <textarea name="summaryVi" rows={3} defaultValue={existing?.summaryVi ?? ""} />
      </label>

      <h3>Highlights (one per line)</h3>
      <label className="admin-field">
        <span>Highlights (EN)</span>
        <textarea name="highlightsEn" rows={4} defaultValue={existing?.highlightsEn.join("\n") ?? ""} />
      </label>
      <label className="admin-field">
        <span>Highlights (VI)</span>
        <textarea name="highlightsVi" rows={4} defaultValue={existing?.highlightsVi.join("\n") ?? ""} />
      </label>

      <h3>Tags (comma-separated)</h3>
      <label className="admin-field">
        <span>Tags (EN)</span>
        <input name="tagsEn" defaultValue={existing?.tagsEn.join(", ") ?? ""} />
      </label>
      <label className="admin-field">
        <span>Tags (VI)</span>
        <input name="tagsVi" defaultValue={existing?.tagsVi.join(", ") ?? ""} />
      </label>

      <label className="admin-field">
        <span>Order</span>
        <input name="order" type="number" defaultValue={existing?.order ?? 0} />
      </label>
      <label className="admin-check">
        <input name="draft" type="checkbox" defaultChecked={existing?.draft} />
        <span>Draft (hidden from public)</span>
      </label>

      {error ? (
        <p className="admin-error" role="alert">
          {error}
        </p>
      ) : null}

      <button disabled={isPending} type="submit">
        {isPending ? "Saving…" : existing ? "Update entry" : "Create entry"}
      </button>
    </form>
  );
}