import assert from "node:assert/strict";
import { test } from "node:test";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Hard local-only guard: this test mutates CMS data and MUST never run against a
// cloud/production project. It only ever touches a handful of fixture rows, but
// we refuse to run unless the URL is the known local Supabase endpoint.
if (!url || !serviceRole) {
  console.error(
    "Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (local Supabase).",
  );
  process.exit(1);
}

const LOCAL_HOST = /^http:\/\/127\.0\.0\.1(?::\d+)?$/;
if (!LOCAL_HOST.test(url)) {
  console.error(
    `Refusing to run repository test against non-local Supabase: ${url}\n` +
      "This test mutates CMS fixtures and must only target local Supabase.",
  );
  process.exit(1);
}

import { createClient } from "@supabase/supabase-js";
import {
  getFeaturedProjects,
  getResumeContent,
} from "@/features/cms/repository";

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

// Cleanup deletes ONLY the fixture ids this test created. Never a mass delete.
async function cleanup() {
  for (const id of Object.values(FIXTURES)) {
    await client.from("projects").delete().eq("id", id);
  }
}

test("public repository only returns featured+published+active projects with media", async () => {
  await cleanup();
  // zero-media project sorts before the valid one by order, so it must be
  // dropped BEFORE index assignment to keep the visible index contiguous.
  await insertProject(FIXTURES.zeroMedia, { withMedia: false, order: 0 });
  await insertProject(FIXTURES.private, { status: "private" });
  await insertProject(FIXTURES.unpublished, { published: false });
  await insertProject(FIXTURES.valid, { withMedia: true, order: 1 });

  try {
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

    // Visible indexes must be contiguous (01, 02, ...) with no gaps, regardless
    // of how many pre-existing renderable projects the DB holds.
    const expectedIndexes = view.projects.map((_, i) =>
      String(i + 1).padStart(2, "0"),
    );
    assert.deepEqual(
      view.projects.map((p) => p.index),
      expectedIndexes,
      "visible indexes are contiguous after zero-media filtering",
    );
  } finally {
    await cleanup();
  }
});

const RESUME_FIXTURES = {
  category: "repo-res-cat",
  published: "repo-res-pub",
  draft: "repo-res-draft",
};

async function insertResumeFixture() {
  const { error: catErr } = await client.from("resume_categories").upsert(
    { id: RESUME_FIXTURES.category, slug: RESUME_FIXTURES.category, order: 1 },
    { onConflict: "id" },
  );
  assert.equal(catErr, null, `resume category: ${catErr?.message}`);

  const { error: catTrErr } = await client
    .from("resume_category_translations")
    .upsert(
      [
        { resume_category_id: RESUME_FIXTURES.category, locale: "en", name: "Test Category" },
        { resume_category_id: RESUME_FIXTURES.category, locale: "vi", name: "Danh mục" },
      ],
      { onConflict: "resume_category_id,locale" },
    );
  assert.equal(catTrErr, null, `resume category translations: ${catTrErr?.message}`);

  for (const [id, draft] of [
    [RESUME_FIXTURES.published, false],
    [RESUME_FIXTURES.draft, true],
  ] as const) {
    const { error: entryErr } = await client.from("resume_entries").upsert(
      { id, category_id: RESUME_FIXTURES.category, order: 1, draft },
      { onConflict: "id" },
    );
    assert.equal(entryErr, null, `resume entry ${id}: ${entryErr?.message}`);

    const { error: trErr } = await client.from("resume_entry_translations").upsert(
      [
        { resume_entry_id: id, locale: "en", title: id, highlights: ["H1"] },
        { resume_entry_id: id, locale: "vi", title: id, highlights: ["H1"] },
      ],
      { onConflict: "resume_entry_id,locale" },
    );
    assert.equal(trErr, null, `resume entry translations ${id}: ${trErr?.message}`);
  }
}

async function cleanupResume() {
  for (const id of [RESUME_FIXTURES.published, RESUME_FIXTURES.draft]) {
    await client.from("resume_entries").delete().eq("id", id);
  }
  await client.from("resume_categories").delete().eq("id", RESUME_FIXTURES.category);
}

test("public resume repository excludes draft entries and groups by category", async () => {
  await cleanupResume();
  await insertResumeFixture();

  try {
    const view = await getResumeContent("en");
    const category = view.categories.find((c) => c.id === RESUME_FIXTURES.category);
    assert.ok(category, "resume category is present");
    const entryIds = category?.entries.map((e) => e.id) ?? [];
    assert.ok(
      entryIds.includes(RESUME_FIXTURES.published),
      "published resume entry is included",
    );
    assert.ok(
      !entryIds.includes(RESUME_FIXTURES.draft),
      "draft resume entry is excluded at the query boundary",
    );
  } finally {
    await cleanupResume();
  }
});
