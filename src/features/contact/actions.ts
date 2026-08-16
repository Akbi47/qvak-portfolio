"use server";

import { headers } from "next/headers";

import { extractClientIdentifier } from "./client-identifier";
import { createResendDeliveryProvider } from "./delivery";
import { createInMemoryRateLimiter } from "./rate-limit";
import {
  submitContact,
  type SubmitContactResult,
} from "./submit";

const CONTACT_RATE_LIMIT = {
  burstLimit: 2,
  burstWindowMs: 60_000,
  hourlyLimit: 5,
  hourlyWindowMs: 3_600_000,
} as const;

/**
 * Process-local rate limiter.
 *
 * Limitation: this reduces abuse per running instance only. It is not a
 * distributed or durable limiter — on serverless/multi-instance
 * deployments each instance keeps its own state, so effective limits are
 * approximate and reset when an instance restarts. A durable limiter
 * (for example Upstash Redis) must be introduced as a separate,
 * explicitly approved change if public launch requires it.
 */
const rateLimiter = createInMemoryRateLimiter({
  ...CONTACT_RATE_LIMIT,
  now: () => Date.now(),
});

function buildProvider() {
  return createResendDeliveryProvider({
    apiKey: process.env.RESEND_API_KEY ?? "",
  });
}

export async function submitContactForm(
  _previousState: SubmitContactResult,
  formData: FormData,
): Promise<SubmitContactResult> {
  const headerStore = await headers();

  // Assumption (Vercel-specific): on Vercel the platform sets
  // `x-forwarded-for` to the client address. No other header is trusted.
  const forwardedFor = headerStore.get("x-forwarded-for") ?? undefined;
  const clientId = extractClientIdentifier(forwardedFor);

  return submitContact(
    {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      subject: String(formData.get("subject") ?? ""),
      message: String(formData.get("message") ?? ""),
      honeypot: String(formData.get("website") ?? ""),
    },
    {
      provider: buildProvider(),
      limiter: rateLimiter,
      clientId,
      fromEmail: process.env.CONTACT_FROM_EMAIL ?? "",
      toEmail: process.env.CONTACT_TO_EMAIL ?? "",
    },
  );
}
