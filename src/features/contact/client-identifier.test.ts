import assert from "node:assert/strict";
import { test } from "node:test";

import { extractClientIdentifier } from "./client-identifier";

test("client-identifier: returns null when header is absent", () => {
  assert.equal(extractClientIdentifier(undefined), null);
});

test("client-identifier: returns null for empty or whitespace-only values", () => {
  assert.equal(extractClientIdentifier(""), null);
  assert.equal(extractClientIdentifier("   "), null);
});

test("client-identifier: uses the first entry of a comma list", () => {
  assert.equal(
    extractClientIdentifier("203.0.113.7, 198.51.100.2"),
    "203.0.113.7",
  );
  assert.equal(
    extractClientIdentifier("2001:db8::1, 203.0.113.7"),
    "2001:db8::1",
  );
});

test("client-identifier: strips an IPv4 port", () => {
  assert.equal(extractClientIdentifier("203.0.113.7:53120"), "203.0.113.7");
});

test("client-identifier: strips brackets and port from an IPv6 literal", () => {
  assert.equal(
    extractClientIdentifier("[2001:db8::1]:53120"),
    "2001:db8::1",
  );
});

test("client-identifier: trims surrounding whitespace", () => {
  assert.equal(extractClientIdentifier("  203.0.113.7  "), "203.0.113.7");
});

test("client-identifier: fails conservatively on a garbage value", () => {
  assert.equal(extractClientIdentifier("not-an-ip-address"), null);
  assert.equal(extractClientIdentifier("spambot.example.com"), null);
});
