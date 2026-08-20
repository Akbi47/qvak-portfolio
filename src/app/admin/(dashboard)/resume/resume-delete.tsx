"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { deleteResumeCategory, deleteResumeEntry } from "./actions";

interface ResumeDeleteButtonProps {
  id: string;
  label: string;
  kind: "category" | "entry";
}

export function ResumeDeleteButton({
  id,
  label,
  kind,
}: ResumeDeleteButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Delete ${kind} "${label}"?`)) return;

    startTransition(async () => {
      const result =
        kind === "category" ? await deleteResumeCategory(id) : await deleteResumeEntry(id);
      if (result.ok) {
        router.refresh();
      } else {
        setError(result.error ?? "Failed to delete.");
      }
    });
  }

  return (
    <>
      <button
        className="admin-link-button admin-link-button--danger"
        disabled={isPending}
        onClick={handleDelete}
        type="button"
      >
        {isPending ? "…" : "Delete"}
      </button>
      {error ? <span className="admin-error">{error}</span> : null}
    </>
  );
}