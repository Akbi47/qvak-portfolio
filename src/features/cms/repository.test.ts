import assert from "node:assert/strict";
import { test } from "node:test";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRole) {
  console.error(
    "Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (local/cloud Supabase).",
  );
  process.exit(1);
}

import { createClient } from "@supabase/supabase-js";
import { getFeaturedProjects } from "@/features/cms/repository";

const client = createClient(url, serviceRole, {
  auth: { persistSession: false },
});

const FIXTURES = {
  valid: "repo-valid",
  private: "repo-private",
  unpublished: "repo-unpublished",
  zeroMedia: "repo-zero-media",
};

async function insertProject(
  id: string,
  opts: { status?: string; published?: boolean; withMedia?: boolean; order?: number },
) {
  const { error } = await client.from("projects").upsert(
    {
      id,
      slug: id,
      tech_stack: ["TS"],
      featured: true,
      order: opts.order ?? 1,
      status: opts.status ?? "active",
      published: opts.published ?? true,
    },
    { onConflict: "id" },
  );
  assert.equal(error, null, `insert ${id}: ${error?.message}`);

  const { error: trErr } = await client.from("project_translations").upsert(
    [
      {
        project_id: id,
        locale: "en",
        title: id,
        category: "Web",
        summary: "Summary",
        highlights: ["H1", "H2"],
      },
      {
        project_id: id,
        locale: "vi",
        title: id,
        category: "Web",
        summary: "Tóm tắt",
        highlights: ["H1", "H2"],
      },
    ],
    { onConflict: "project_id,locale" },
  );
  assert.equal(trErr, null, `translations ${id}: ${trErr?.message}`);

  if (opts.withMedia) {
    const { error: mediaErr } = await client.from("project_media").upsert(
      {
        id: `${id}-main`,
        project_id: id,
        src: "/images/projects/test.jpg",
        width: 800,
        height: 600,
        order: 1,
        focal_point: "40% 60%",
      },
      { onConflict: "id" },
    );
    assert.equal(mediaErr, null, `media ${id}: ${mediaErr?.message}`);
  }
}

async function cleanup() {
  // Isolate from any pre-existing projects so fixture ordering is deterministic.
  const { error } = await client.from("projects").delete().neq("id", "__none__");
  assert.equal(error, null, `cleanup projects: ${error?.message}`);
}

test("public repository only returns featured+published+active projects with media", async () => {
  await cleanup();
  // zero-media project sorts before the valid one by order, so it must be
  // dropped BEFORE index assignment to keep the visible index contiguous.
  await insertProject(FIXTURES.zeroMedia, { withMedia: false, order: 0 });
  await insertProject(FIXTURES.private, { status: "private" });
  await insertProject(FIXTURES.unpublished, { published: false });
  await insertProject(FIXTURES.valid, { withMedia: true, order: 1 });

  const view = await getFeaturedProjects("en");
  const ids = view.projects.map((p) => p.id);

  assert.ok(
    ids.includes(FIXTURES.valid),
    "valid featured+published+active project with media is included",
  );
  assert.ok(
    !ids.includes(FIXTURES.private),
    "private project is excluded at the query boundary",
  );
  assert.ok(
    !ids.includes(FIXTURES.unpublished),
    "unpublished project is excluded at the query boundary",
  );
  assert.ok(
    !ids.includes(FIXTURES.zeroMedia),
    "featured+published+active project with zero media is filtered out",
  );

  const valid = view.projects.find((p) => p.id === FIXTURES.valid);
  assert.ok(valid, "valid project present");
  assert.equal(
    valid?.index,
    "01",
    "visible indexes are contiguous (zero-media project dropped before numbering)",
  );
  assert.deepEqual(
    valid?.highlights,
    ["H1", "H2"],
    "highlights are preserved",
  );
  assert.equal(
    valid?.media[0]?.focalPoint,
    "40% 60%",
    "media focalPoint is preserved",
  );

  await cleanup();
});
