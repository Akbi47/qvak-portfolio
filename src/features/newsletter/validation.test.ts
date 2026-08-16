import assert from "node:assert/strict";
import { test } from "node:test";

import { validateNewsletterSignup } from "./validation";

interface Expectation {
  label: string;
  email: string;
  want: "required" | "too-long" | "invalid-email" | null;
}

const table: Expectation[] = [
  { label: "accepts a valid email", email: "visitor@example.com", want: null },
  {
    label: "trims surrounding whitespace before validating",
    email: "  visitor@example.com  ",
    want: null,
  },
  { label: "rejects missing email", email: "", want: "required" },
  { label: "rejects whitespace-only email", email: "   ", want: "required" },
  { label: "rejects malformed email", email: "not-an-email", want: "invalid-email" },
  { label: "rejects email without domain", email: "visitor@", want: "invalid-email" },
  { label: "rejects email missing local part", email: "@example.com", want: "invalid-email" },
  { label: "rejects email missing dot in domain", email: "visitor@example", want: "invalid-email" },
  {
    label: "rejects email above maximum length",
    email: `${"a".repeat(243)}@example.com`,
    want: "too-long",
  },
  {
    label: "accepts email at maximum length",
    email: `${"a".repeat(242)}@example.com`,
    want: null,
  },
];

for (const entry of table) {
  test(`newsletter validation: ${entry.label}`, () => {
    const errors = validateNewsletterSignup({ email: entry.email });
    assert.equal(errors.email ?? null, entry.want);
  });
}
