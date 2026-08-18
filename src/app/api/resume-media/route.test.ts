import assert from "node:assert/strict";
import { test } from "node:test";

import { siteConfig } from "@/content/site-config";
import { GET } from "./[file]/route";

test("resume-media route returns 404 while the resume section is private", async () => {
  const response = await GET(
    new Request("http://localhost/api/resume-media/transcript.jpg"),
    { params: Promise.resolve({ file: "transcript.jpg" }) },
  );
  assert.equal(response.status, 404);
  assert.match(await response.text(), /Resume is private/);
});

test("resume-media route rejects files outside the approved allowlist", async () => {
  const response = await GET(
    new Request("http://localhost/api/resume-media/not-approved.jpg"),
    { params: Promise.resolve({ file: "not-approved.jpg" }) },
  );
  assert.equal(response.status, 404);
});

test("gated 404 responses are not cached (revocable privacy)", async () => {
  const response = await GET(
    new Request("http://localhost/api/resume-media/transcript.jpg"),
    { params: Promise.resolve({ file: "transcript.jpg" }) },
  );
  assert.equal(response.status, 404);
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("visible responses are served but never cached long-term", async () => {
  const previous = siteConfig.sections.resume.publicity;
  siteConfig.sections.resume.publicity = "visible";
  try {
    const response = await GET(
      new Request("http://localhost/api/resume-media/transcript.jpg"),
      { params: Promise.resolve({ file: "transcript.jpg" }) },
    );
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "image/jpeg");
    assert.equal(response.headers.get("cache-control"), "no-store");
  } finally {
    siteConfig.sections.resume.publicity = previous;
  }
});