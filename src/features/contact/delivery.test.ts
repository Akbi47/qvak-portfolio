import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createResendDeliveryProvider,
  type ContactMessage,
} from "./delivery";

const validMessage: ContactMessage = {
  from: "sender@verified-domain.com",
  to: "owner@example.com",
  replyTo: "visitor@example.com",
  subject: "Project inquiry",
  text: "Hello, I would like to discuss a project with you.",
};

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

test("delivery: success response maps to accepted", async () => {
  let calledUrl = "";
  let calledInit: RequestInit | undefined;

  const provider = createResendDeliveryProvider({
    apiKey: "re_secret_key",
    fetchFn: async (url, init) => {
      calledUrl = String(url);
      calledInit = init;
      return jsonResponse(200, { id: "resend-message-123" });
    },
  });

  const result = await provider.send(validMessage);

  assert.equal(result.status, "accepted");
  assert.equal(calledUrl, "https://api.resend.com/emails");
  assert.equal(calledInit?.method, "POST");
  const headers = new Headers(calledInit?.headers);
  assert.equal(headers.get("authorization"), "Bearer re_secret_key");
  assert.equal(headers.get("content-type"), "application/json");

  const body = JSON.parse(String(calledInit?.body));
  assert.deepEqual(body, {
    from: "sender@verified-domain.com",
    to: "owner@example.com",
    reply_to: "visitor@example.com",
    subject: "Project inquiry",
    text: "Hello, I would like to discuss a project with you.",
  });
});

test("delivery: provider 4xx maps to rejected, never accepted", async () => {
  const provider = createResendDeliveryProvider({
    apiKey: "re_secret_key",
    fetchFn: async () => jsonResponse(400, { message: "bad request" }),
  });

  const result = await provider.send(validMessage);

  assert.equal(result.status, "rejected");
});

test("delivery: provider 5xx maps to rejected, never accepted", async () => {
  const provider = createResendDeliveryProvider({
    apiKey: "re_secret_key",
    fetchFn: async () => jsonResponse(503, { message: "unavailable" }),
  });

  const result = await provider.send(validMessage);

  assert.equal(result.status, "rejected");
});

test("delivery: network failure maps to error, never accepted", async () => {
  const provider = createResendDeliveryProvider({
    apiKey: "re_secret_key",
    fetchFn: async () => {
      throw new Error("connection reset");
    },
  });

  const result = await provider.send(validMessage);

  assert.equal(result.status, "error");
});

test("delivery: fetch abort (timeout) maps to error, never accepted", async () => {
  const provider = createResendDeliveryProvider({
    apiKey: "re_secret_key",
    fetchFn: async (_url, init) => {
      assert.ok(init?.signal, "expected an AbortSignal");
      init?.signal?.throwIfAborted();
      throw new Error("aborted");
    },
  });

  const result = await provider.send(validMessage);

  assert.equal(result.status, "error");
});

test("delivery: missing api key is rejected before fetch", async () => {
  const provider = createResendDeliveryProvider({
    apiKey: "",
    fetchFn: async () => {
      throw new Error("should not be called");
    },
  });

  const result = await provider.send(validMessage);

  assert.equal(result.status, "error");
});
