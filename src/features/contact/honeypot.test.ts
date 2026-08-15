import assert from "node:assert/strict";
import { test } from "node:test";

import { isHoneypotFilled } from "./honeypot";

test("honeypot: empty value is not filled", () => {
  assert.equal(isHoneypotFilled(""), false);
  assert.equal(isHoneypotFilled("   "), false);
  assert.equal(isHoneypotFilled(undefined), false);
});

test("honeypot: non-empty value is filled", () => {
  assert.equal(isHoneypotFilled("spambot"), true);
  assert.equal(isHoneypotFilled("  x  "), true);
});
