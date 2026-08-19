import assert from "node:assert/strict";
import { test } from "node:test";

import { GET } from "./[file]/route";
import {
  getResumePublicity,
  setResumePublicityForTest,
} from "@/features/cms/resume-publicity";

test("resume-media route returns 404 while the resume section is private", async () => {
  setResumePublicityForTest("private");
  try {
    const response = await GET(
      new Request("http://localhost/api/resume-media/transcript.jpg"),
      { params: Promise.resolve({ file: "transcript.jpg" }) },
    );
    assert.equal(response.status, 404);
    assert.match(await response.text(), /Resume is private/);
  } finally {
    setResumePublicityForTest(null);
  }
});

test("resume-media route rejects files outside the approved allowlist", async () => {
  setResumePublicityForTest("visible");
  try {
    const response = await GET(
      new Request("http://localhost/api/resume-media/not-approved.jpg"),
      { params: Promise.resolve({ file: "not-approved.jpg" }) },
    );
    assert.equal(response.status, 404);
  } finally {
    setResumePublicityForTest(null);
  }
});

test("gated 404 responses are not cached (revocable privacy)", async () => {
  setResumePublicityForTest("private");
  try {
    const response = await GET(
      new Request("http://localhost/api/resume-media/transcript.jpg"),
      { params: Promise.resolve({ file: "transcript.jpg" }) },
    );
    assert.equal(response.status, 404);
    assert.equal(response.headers.get("cache-control"), "no-store");
  } finally {
    setResumePublicityForTest(null);
  }
});

test("visible responses are served but never cached long-term", async () => {
  setResumePublicityForTest("visible");
  try {
    const response = await GET(
      new Request("http://localhost/api/resume-media/transcript.jpg"),
      { params: Promise.resolve({ file: "transcript.jpg" }) },
    );
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "image/jpeg");
    assert.equal(response.headers.get("cache-control"), "no-store");
  } finally {
    setResumePublicityForTest(null);
  }
});

test("runtime gate fails closed to private when the source is unavailable", async () => {
  setResumePublicityForTest(null);
  const publicity = await getResumePublicity();
  assert.equal(publicity, "private");
});
