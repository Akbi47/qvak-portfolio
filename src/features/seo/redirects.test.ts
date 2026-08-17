import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildRedirectUrl,
  getLegacyRedirectTarget,
  normalizeTrailingSlash,
} from "./redirects";

test("legacy redirect: /resume maps to #resume on en root", () => {
  assert.deepEqual(getLegacyRedirectTarget("en", "/resume"), {
    pathname: "/",
    hash: "#resume",
  });
});

test("legacy redirect: /resume/ maps to #resume on en root", () => {
  assert.deepEqual(getLegacyRedirectTarget("en", "/resume/"), {
    pathname: "/",
    hash: "#resume",
  });
});

test("legacy redirect: /case-studies maps to #projects on en root", () => {
  assert.deepEqual(getLegacyRedirectTarget("en", "/case-studies"), {
    pathname: "/",
    hash: "#projects",
  });
});

test("legacy redirect: vi locale resolves to /vi root", () => {
  assert.deepEqual(getLegacyRedirectTarget("vi", "/case-studies/"), {
    pathname: "/vi",
    hash: "#projects",
  });
});

test("legacy redirect: unknown path returns null", () => {
  assert.equal(getLegacyRedirectTarget("en", "/blog"), null);
});

test("trailing slash: /vi/ normalizes to /vi", () => {
  assert.equal(normalizeTrailingSlash("/vi/"), "/vi");
});

test("trailing slash: multiple slashes collapse", () => {
  assert.equal(normalizeTrailingSlash("/vi//"), "/vi");
});

test("trailing slash: root is untouched", () => {
  assert.equal(normalizeTrailingSlash("/"), null);
});

test("trailing slash: path without slash is untouched", () => {
  assert.equal(normalizeTrailingSlash("/vi"), null);
});

test("redirect url: query string precedes the fragment", () => {
  const target = buildRedirectUrl(
    "http://localhost:3000",
    "/",
    "?utm_source=x",
    "#resume",
  );

  assert.equal(target.pathname, "/");
  assert.equal(target.search, "?utm_source=x");
  assert.equal(target.hash, "#resume");
  assert.equal(
    target.toString(),
    "http://localhost:3000/?utm_source=x#resume",
  );
});

test("redirect url: vi locale keeps query before fragment", () => {
  const target = buildRedirectUrl(
    "http://localhost:3000",
    "/vi",
    "?utm_source=x",
    "#projects",
  );

  assert.equal(
    target.toString(),
    "http://localhost:3000/vi?utm_source=x#projects",
  );
});
