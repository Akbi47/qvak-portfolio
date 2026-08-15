import assert from "node:assert/strict";
import { test } from "node:test";

import {
  validateContactSubmission,
  type ContactFieldName,
} from "./validation";

interface Expectation {
  label: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  want: ContactFieldName[];
}

const table: Expectation[] = [
  {
    label: "accepts a valid trimmed payload",
    name: "Khoa Quach",
    email: "visitor@example.com",
    subject: "Project inquiry",
    message: "Hello, I would like to discuss a project with you.",
    want: [],
  },
  {
    label: "trims surrounding whitespace before validating",
    name: "  Khoa Quach  ",
    email: "  visitor@example.com  ",
    subject: "  Project inquiry  ",
    message: "  Hello, I would like to discuss a project with you.  ",
    want: [],
  },
  {
    label: "rejects missing name",
    name: "",
    email: "visitor@example.com",
    subject: "Project inquiry",
    message: "Hello, I would like to discuss a project with you.",
    want: ["name"],
  },
  {
    label: "rejects missing email",
    name: "Khoa Quach",
    email: "",
    subject: "Project inquiry",
    message: "Hello, I would like to discuss a project with you.",
    want: ["email"],
  },
  {
    label: "rejects missing subject",
    name: "Khoa Quach",
    email: "visitor@example.com",
    subject: "",
    message: "Hello, I would like to discuss a project with you.",
    want: ["subject"],
  },
  {
    label: "rejects missing message",
    name: "Khoa Quach",
    email: "visitor@example.com",
    subject: "Project inquiry",
    message: "",
    want: ["message"],
  },
  {
    label: "rejects blank whitespace-only fields",
    name: "   ",
    email: "   ",
    subject: "   ",
    message: "   ",
    want: ["name", "email", "subject", "message"],
  },
  {
    label: "rejects malformed email",
    name: "Khoa Quach",
    email: "not-an-email",
    subject: "Project inquiry",
    message: "Hello, I would like to discuss a project with you.",
    want: ["email"],
  },
  {
    label: "rejects email without domain",
    name: "Khoa Quach",
    email: "visitor@",
    subject: "Project inquiry",
    message: "Hello, I would like to discuss a project with you.",
    want: ["email"],
  },
  {
    label: "rejects email missing local part",
    name: "Khoa Quach",
    email: "@example.com",
    subject: "Project inquiry",
    message: "Hello, I would like to discuss a project with you.",
    want: ["email"],
  },
  {
    label: "rejects name below minimum length",
    name: "A",
    email: "visitor@example.com",
    subject: "Project inquiry",
    message: "Hello, I would like to discuss a project with you.",
    want: ["name"],
  },
  {
    label: "accepts name at minimum length",
    name: "Aa",
    email: "visitor@example.com",
    subject: "Project inquiry",
    message: "Hello, I would like to discuss a project with you.",
    want: [],
  },
  {
    label: "rejects name above maximum length",
    name: "x".repeat(81),
    email: "visitor@example.com",
    subject: "Project inquiry",
    message: "Hello, I would like to discuss a project with you.",
    want: ["name"],
  },
  {
    label: "accepts name at maximum length",
    name: "x".repeat(80),
    email: "visitor@example.com",
    subject: "Project inquiry",
    message: "Hello, I would like to discuss a project with you.",
    want: [],
  },
  {
    label: "rejects subject below minimum length",
    name: "Khoa Quach",
    email: "visitor@example.com",
    subject: "A",
    message: "Hello, I would like to discuss a project with you.",
    want: ["subject"],
  },
  {
    label: "rejects subject above maximum length",
    name: "Khoa Quach",
    email: "visitor@example.com",
    subject: "x".repeat(121),
    message: "Hello, I would like to discuss a project with you.",
    want: ["subject"],
  },
  {
    label: "rejects message below minimum length",
    name: "Khoa Quach",
    email: "visitor@example.com",
    subject: "Project inquiry",
    message: "Too short",
    want: ["message"],
  },
  {
    label: "accepts message at minimum length",
    name: "Khoa Quach",
    email: "visitor@example.com",
    subject: "Project inquiry",
    message: "1234567890",
    want: [],
  },
  {
    label: "rejects message above maximum length",
    name: "Khoa Quach",
    email: "visitor@example.com",
    subject: "Project inquiry",
    message: "x".repeat(4001),
    want: ["message"],
  },
  {
    label: "accepts message at maximum length",
    name: "Khoa Quach",
    email: "visitor@example.com",
    subject: "Project inquiry",
    message: "x".repeat(4000),
    want: [],
  },
  {
    label: "rejects email above maximum length",
    name: "Khoa Quach",
    email: `${"a".repeat(243)}@example.com`,
    subject: "Project inquiry",
    message: "Hello, I would like to discuss a project with you.",
    want: ["email"],
  },
];

for (const entry of table) {
  test(`validation: ${entry.label}`, () => {
    const errors = validateContactSubmission({
      name: entry.name,
      email: entry.email,
      subject: entry.subject,
      message: entry.message,
    });

    const errorFields = Object.keys(errors) as ContactFieldName[];
    assert.deepEqual(errorFields.sort(), [...entry.want].sort());
  });
}
