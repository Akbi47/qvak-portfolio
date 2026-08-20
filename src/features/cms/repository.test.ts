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

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  getFeaturedProjects,
  getResumeContent,
} from "@/features/cms/repository";
import { findMediaReferences } from "@/features/cms/media";

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

const MEDIA_BUCKETS = {
  public: "project-media",
  private: "resume-media",
} as const;

test("storage media permissions: owner writes, anonymous denied", async (t) => {
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!anonKey) {
    t.skip("NEXT_PUBLIC_SUPABASE_ANON_KEY not set");
    return;
  }

  const { createClient } = await import("@supabase/supabase-js");

  // Dedicated anonymous client — never authenticated, used for anon operations.
  const anonClient = createClient(url, anonKey, {
    auth: { persistSession: false },
  });

  // Separate client used only to obtain the owner token.
  const authClient = createClient(url, anonKey, {
    auth: { persistSession: false },
  });
  const { data: signIn } = await authClient.auth.signInWithPassword({
    email: process.env.CMS_ADMIN_EMAIL ?? "admin@khoawatt.com",
    password: process.env.CMS_ADMIN_PASSWORD ?? "test-password-123",
  });
  if (!signIn.session) {
    t.skip("owner sign-in failed; cannot verify storage RLS");
    return;
  }
  const ownerToken = signIn.session.access_token;
  const ownerClient = createClient(url, anonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${ownerToken}` } },
  });

  const marker = `rls-${Date.now()}.jpg`;
  const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3]);

  try {
    // Owner can upload to a public bucket.
    const ownerUpload = await ownerClient.storage
      .from(MEDIA_BUCKETS.public)
      .upload(marker, bytes, { contentType: "image/jpeg" });
    assert.equal(ownerUpload.error, null, "owner upload to public bucket");

    // Anonymous cannot upload (owner-write policy).
    const anonUpload = await anonClient.storage
      .from(MEDIA_BUCKETS.public)
      .upload(`anon-${marker}`, bytes, { contentType: "image/jpeg" });
    assert.ok(anonUpload.error, "anonymous upload to public bucket is denied");

    // Anonymous cannot read the private bucket.
    const anonDownload = await anonClient.storage
      .from(MEDIA_BUCKETS.private)
      .download(marker);
    assert.ok(anonDownload.error, "anonymous read of private bucket is denied");
  } finally {
    await ownerClient.storage.from(MEDIA_BUCKETS.public).remove([marker]);
  }
});

const REF_FIXTURES = {
  project: "ref-project",
  resumeEntry: "ref-resume-entry",
  resumeMedia: "ref-resume-media",
  projectMedia: "ref-project-media",
  path: "ref-file.jpg",
};

async function createReferenceParents() {
  const { error: projErr } = await client.from("projects").upsert(
    { id: REF_FIXTURES.project, slug: REF_FIXTURES.project, featured: false, order: 99 },
    { onConflict: "id" },
  );
  assert.equal(projErr, null, `ref project: ${projErr?.message}`);

  const { error: catErr } = await client.from("resume_categories").upsert(
    { id: "ref-cat", slug: "ref-cat", order: 99 },
    { onConflict: "id" },
  );
  assert.equal(catErr, null, `ref category: ${catErr?.message}`);

  const { error: entryErr } = await client.from("resume_entries").upsert(
    { id: REF_FIXTURES.resumeEntry, category_id: "ref-cat", order: 99, draft: false },
    { onConflict: "id" },
  );
  assert.equal(entryErr, null, `ref entry: ${entryErr?.message}`);
}

async function insertMediaReference(kind: "project" | "resume") {
  if (kind === "project") {
    const { error } = await client.from("project_media").upsert(
      {
        id: REF_FIXTURES.projectMedia,
        project_id: REF_FIXTURES.project,
        src: `/images/${REF_FIXTURES.path}`,
        kind: "image",
        order: 1,
      },
      { onConflict: "id" },
    );
    assert.equal(error, null, `project media ref: ${error?.message}`);
  } else {
    const { error } = await client.from("resume_media").upsert(
      {
        id: REF_FIXTURES.resumeMedia,
        resume_entry_id: REF_FIXTURES.resumeEntry,
        thumbnail_src: `/api/resume-media/${REF_FIXTURES.path}`,
        full_src: `/api/resume-media/${REF_FIXTURES.path}`,
        order: 1,
      },
      { onConflict: "id" },
    );
    assert.equal(error, null, `resume media ref: ${error?.message}`);
  }
}

async function cleanupReferenceFixtures() {
  await client.from("project_media").delete().eq("id", REF_FIXTURES.projectMedia);
  await client.from("resume_media").delete().eq("id", REF_FIXTURES.resumeMedia);
  await client.from("resume_entries").delete().eq("id", REF_FIXTURES.resumeEntry);
  await client.from("resume_categories").delete().eq("id", "ref-cat");
  await client.from("projects").delete().eq("id", REF_FIXTURES.project);
}

test("deletion reference check blocks referenced media and allows unreferenced", async () => {
  await cleanupReferenceFixtures();
  await createReferenceParents();

  // Unreferenced -> allowed.
  assert.equal(
    await findMediaReferences(client, "project-media", REF_FIXTURES.path),
    0,
    "unreferenced project media reports 0 references",
  );
  assert.equal(
    await findMediaReferences(client, "resume-media", REF_FIXTURES.path),
    0,
    "unreferenced resume media reports 0 references",
  );

  try {
    // Referenced -> blocked (returns a positive count).
    await insertMediaReference("project");
    assert.ok(
      (await findMediaReferences(client, "project-media", REF_FIXTURES.path)) > 0,
      "referenced project media reports a reference",
    );

    await insertMediaReference("resume");
    assert.ok(
      (await findMediaReferences(client, "resume-media", REF_FIXTURES.path)) > 0,
      "referenced resume media reports a reference",
    );
  } finally {
    await cleanupReferenceFixtures();
  }
});

test("deletion reference check fails closed when the reference query errors", async () => {
  const failingClient = {
    from: () => ({
      select: () => ({
        or: async () => ({
          data: null,
          error: { message: "connection refused" },
        }),
      }),
    }),
  } as unknown as SupabaseClient;

  // A reference-query error must throw so deleteMedia refuses to delete,
  // never treating an unknown reference state as "safe to delete".
  await assert.rejects(
    () => findMediaReferences(failingClient, "project-media", "file.jpg"),
    /Reference check failed/,
  );
  await assert.rejects(
    () => findMediaReferences(failingClient, "resume-media", "file.jpg"),
    /Reference check failed/,
  );
});
