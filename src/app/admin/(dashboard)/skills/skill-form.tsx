"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { SkillGroup } from "@/content/skills";
import type { AdminSkillRow } from "./data";
import { createSkill, updateSkill, type SkillActionResult } from "./actions";

const iconOptions = [
  "typescript",
  "javascript",
  "react",
  "nextjs",
  "nodejs",
  "nestjs",
  "postgresql",
  "wordpress",
] as const;

interface SkillFormProps {
  existing?: AdminSkillRow;
}

export function SkillForm({ existing }: SkillFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);

    const data = {
      id: existing?.id ?? String(fd.get("id") ?? ""),
      nameEn: String(fd.get("nameEn") ?? ""),
      nameVi: String(fd.get("nameVi") ?? ""),
      group: String(fd.get("group") ?? "tech-stack") as SkillGroup,
      categoryEn: String(fd.get("categoryEn") ?? ""),
      categoryVi: String(fd.get("categoryVi") ?? ""),
      iconKey: String(fd.get("iconKey") ?? "") || undefined,
      url: String(fd.get("url") ?? ""),
      order: Number(fd.get("order") ?? 0),
      featured: fd.get("featured") === "on",
    };

    startTransition(async () => {
      const result: SkillActionResult = existing
        ? await updateSkill(data)
        : await createSkill(data);
      if (result.ok) {
        router.push("/admin/skills");
        router.refresh();
      } else {
        setError(result.fieldErrors ? Object.values(result.fieldErrors).join(" ") : (result.error ?? "Failed."));
      }
    });
  }

  return (
    <form className="admin-form" onSubmit={onSubmit}>
      {!existing ? (
        <label className="admin-field">
          <span>Skill ID (slug)</span>
          <input name="id" required defaultValue="" />
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
        <span>Group</span>
        <select name="group" defaultValue={existing?.group ?? "tech-stack"}>
          <option value="tech-stack">Tech Stack</option>
          <option value="others">Others</option>
        </select>
      </label>

      <label className="admin-field">
        <span>Category (EN) — Others only</span>
        <input name="categoryEn" defaultValue={existing?.categoryEn ?? ""} />
      </label>
      <label className="admin-field">
        <span>Category (VI) — Others only</span>
        <input name="categoryVi" defaultValue={existing?.categoryVi ?? ""} />
      </label>

      <label className="admin-field">
        <span>Icon key</span>
        <select name="iconKey" defaultValue={existing?.iconKey ?? ""}>
          <option value="">None</option>
          {iconOptions.map((icon) => (
            <option key={icon} value={icon}>
              {icon}
            </option>
          ))}
        </select>
      </label>

      <label className="admin-field">
        <span>URL (optional, http/https)</span>
        <input name="url" defaultValue={existing?.url ?? ""} />
      </label>

      <label className="admin-field">
        <span>Order</span>
        <input name="order" type="number" defaultValue={existing?.order ?? 0} />
      </label>

      <label className="admin-check">
        <input name="featured" type="checkbox" defaultChecked={existing?.featured} />
        <span>Featured</span>
      </label>

      {error ? (
        <p className="admin-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="admin-form-actions">
        <button disabled={isPending} type="submit">
          {isPending ? "Saving…" : existing ? "Update skill" : "Create skill"}
        </button>
        <Link href="/admin/skills">Cancel</Link>
      </div>
    </form>
  );
}
