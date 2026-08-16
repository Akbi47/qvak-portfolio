import assert from "node:assert/strict";
import { test } from "node:test";

import {
  submitContact,
  type SubmitContactDeps,
  type SubmitContactInput,
} from "./submit";

import type { ContactDeliveryProvider } from "./delivery";
import type { RateLimiter } from "./rate-limit";

const validInput: SubmitContactInput = {
  name: "Khoa Quach",
  email: "visitor@example.com",
  subject: "Project inquiry",
  message: "Hello, I would like to discuss a project with you.",
  honeypot: "",
};

function makeDeps(overrides: Partial<SubmitContactDeps> = {}): SubmitContactDeps {
  return {
    provider: {
      send: async () => ({ status: "accepted" }),
    },
    limiter: {
      tryConsume: () => true,
      reset: () => {},
    },
    clientId: "203.0.113.7",
    fromEmail: "sender@verified-domain.com",
    toEmail: "owner@example.com",
    ...overrides,
  };
}

test("submit: valid payload with provider acceptance maps to success", async () => {
  let sent: unknown;
  const provider: ContactDeliveryProvider = {
    send: async (message) => {
      sent = message;
      return { status: "accepted" };
    },
  };

  const result = await submitContact(validInput, makeDeps({ provider }));

  assert.equal(result.status, "success");
  assert.deepEqual(sent, {
    from: "sender@verified-domain.com",
    to: "owner@example.com",
    replyTo: "visitor@example.com",
    subject: "Project inquiry",
    text: 'From: Khoa Quach <visitor@example.com>\n\nHello, I would like to discuss a project with you.',
  });
});

test("submit: invalid payload returns field-error and never calls provider", async () => {
  let providerCalled = false;
  const provider: ContactDeliveryProvider = {
    send: async () => {
      providerCalled = true;
      return { status: "accepted" };
    },
  };

  const result = await submitContact(
    { ...validInput, email: "not-an-email" },
    makeDeps({ provider }),
  );

  assert.equal(result.status, "field-error");
  assert.ok("email" in result.fieldErrors);
  assert.equal(providerCalled, false);
});

test("submit: honeypot filled returns rejected and never calls provider", async () => {
  let providerCalled = false;
  const provider: ContactDeliveryProvider = {
    send: async () => {
      providerCalled = true;
      return { status: "accepted" };
    },
  };

  const result = await submitContact(
    { ...validInput, honeypot: "spambot" },
    makeDeps({ provider }),
  );

  assert.equal(result.status, "rejected");
  assert.equal(providerCalled, false);
});

test("submit: missing client identifier fails conservatively as rejected", async () => {
  let providerCalled = false;
  const provider: ContactDeliveryProvider = {
    send: async () => {
      providerCalled = true;
      return { status: "accepted" };
    },
  };

  const result = await submitContact(
    validInput,
    makeDeps({ provider, clientId: null }),
  );

  assert.equal(result.status, "rejected");
  assert.equal(providerCalled, false);
});

test("submit: rate limited returns rate-limited and never calls provider", async () => {
  let providerCalled = false;
  const provider: ContactDeliveryProvider = {
    send: async () => {
      providerCalled = true;
      return { status: "accepted" };
    },
  };
  const limiter: RateLimiter = {
    tryConsume: () => false,
    reset: () => {},
  };

  const result = await submitContact(
    validInput,
    makeDeps({ provider, limiter }),
  );

  assert.equal(result.status, "rate-limited");
  assert.equal(providerCalled, false);
});

test("submit: provider rejected maps to server-error", async () => {
  const provider: ContactDeliveryProvider = {
    send: async () => ({ status: "rejected" }),
  };

  const result = await submitContact(validInput, makeDeps({ provider }));

  assert.equal(result.status, "server-error");
});

test("submit: provider error maps to server-error", async () => {
  const provider: ContactDeliveryProvider = {
    send: async () => ({ status: "error" }),
  };

  const result = await submitContact(validInput, makeDeps({ provider }));

  assert.equal(result.status, "server-error");
});

test("submit: missing from email is server-error and never calls provider", async () => {
  let providerCalled = false;
  const provider: ContactDeliveryProvider = {
    send: async () => {
      providerCalled = true;
      return { status: "accepted" };
    },
  };

  const result = await submitContact(
    validInput,
    makeDeps({ provider, fromEmail: "" }),
  );

  assert.equal(result.status, "server-error");
  assert.equal(providerCalled, false);
});

test("submit: missing to email is server-error and never calls provider", async () => {
  let providerCalled = false;
  const provider: ContactDeliveryProvider = {
    send: async () => {
      providerCalled = true;
      return { status: "accepted" };
    },
  };

  const result = await submitContact(
    validInput,
    makeDeps({ provider, toEmail: "" }),
  );

  assert.equal(result.status, "server-error");
  assert.equal(providerCalled, false);
});

test("submit: provider failure can never map to success", async () => {
  for (const delivery of [
    { status: "rejected" },
    { status: "error" },
  ] as const) {
    const provider: ContactDeliveryProvider = {
      send: async () => delivery,
    };

    const result = await submitContact(validInput, makeDeps({ provider }));

    assert.notEqual(result.status, "success", `for ${delivery.status}`);
    assert.equal(result.status, "server-error");
  }
});
