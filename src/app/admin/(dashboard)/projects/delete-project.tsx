"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { deleteProject } from "./actions";

interface DeleteProjectButtonProps {
  id: string;
  title: string;
}

export function DeleteProjectButton({ id, title }: DeleteProjectButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Delete project "${title}"?`)) return;

    startTransition(async () => {
      const result = await deleteProject(id);
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