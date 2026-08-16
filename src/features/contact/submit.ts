import type { ContactDeliveryProvider } from "./delivery";
import { isHoneypotFilled } from "./honeypot";
import type { RateLimiter } from "./rate-limit";
import {
  validateContactSubmission,
  type ContactFieldErrors,
} from "./validation";

export interface SubmitContactInput {
  name: string;
  email: string;
  subject: string;
  message: string;
  honeypot: string;
}

export interface SubmitContactDeps {
  provider: ContactDeliveryProvider;
  limiter: RateLimiter;
  clientId: string | null;
  fromEmail: string;
  toEmail: string;
}

export type SubmitContactResult =
  | { status: "idle" }
  | { status: "field-error"; fieldErrors: ContactFieldErrors }
  | { status: "rejected" }
  | { status: "rate-limited" }
  | { status: "server-error" }
  | { status: "success" };

export async function submitContact(
  input: SubmitContactInput,
  deps: SubmitContactDeps,
): Promise<SubmitContactResult> {
  if (isHoneypotFilled(input.honeypot)) {
    return { status: "rejected" };
  }

  if (deps.clientId === null) {
    return { status: "rejected" };
  }

  const fieldErrors = validateContactSubmission(input);
  if (Object.keys(fieldErrors).length > 0) {
    return { status: "field-error", fieldErrors };
  }

  const fromEmail = deps.fromEmail.trim();
  const toEmail = deps.toEmail.trim();

  if (fromEmail.length === 0 || toEmail.length === 0) {
    return { status: "server-error" };
  }

  if (!deps.limiter.tryConsume(deps.clientId)) {
    return { status: "rate-limited" };
  }

  const delivery = await deps.provider.send({
    from: fromEmail,
    to: toEmail,
    replyTo: input.email.trim(),
    subject: input.subject.trim(),
    text: [
      `From: ${input.name.trim()} <${input.email.trim()}>`,
      ``,
      input.message.trim(),
    ].join("\n"),
  });

  switch (delivery.status) {
    case "accepted":
      return { status: "success" };
    case "rejected":
    case "error":
      return { status: "server-error" };
  }
}
