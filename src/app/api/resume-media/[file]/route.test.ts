import assert from "node:assert/strict";
import { test } from "node:test";

import { GET } from "./route";

test("resume-media route returns 404 while the resume section is private", async () => {
  const response = await GET(new Request("http://localhost/api/resume-media/transcript.jpg"), {
    params: Promise.resolve({ file: "transcript.jpg" }),
  });
  assert.equal(response.status, 404);
  assert.match(await response.text(), /Resume is private/);
});

test("resume-media route rejects files outside the approved allowlist", async () => {
  const response = await GET(new Request("http://localhost/api/resume-media/not-approved.jpg"), {
    params: Promise.resolve({ file: "not-approved.jpg" }),
  });
  assert.equal(response.status, 404);
});