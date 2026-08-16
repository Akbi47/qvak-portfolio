export type NewsletterFieldErrorCode =
  | "required"
  | "too-long"
  | "invalid-email";

export type NewsletterFieldErrors = Partial<{
  email: NewsletterFieldErrorCode;
}>;

export interface NewsletterSignupInput {
  email: string;
}

export const NEWSLETTER_EMAIL_MAX = 254;

function isValidEmail(email: string): boolean {
  if (email.length > NEWSLETTER_EMAIL_MAX) {
    return false;
  }

  const atIndex = email.indexOf("@");
  const lastAtIndex = email.lastIndexOf("@");

  if (atIndex <= 0 || lastAtIndex !== atIndex) {
    return false;
  }

  const local = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);

  if (local.length === 0 || domain.length === 0) {
    return false;
  }

  if (!domain.includes(".")) {
    return false;
  }

  const invalidChars = /[^\w.!#$%&'*+/=?^`{|}~-]/;
  if (invalidChars.test(local)) {
    return false;
  }

  const domainPart = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return domainPart.test(domain);
}

export function validateNewsletterSignup(
  input: NewsletterSignupInput,
): NewsletterFieldErrors {
  const email = input.email.trim();

  if (email.length === 0) {
    return { email: "required" };
  }

  if (email.length > NEWSLETTER_EMAIL_MAX) {
    return { email: "too-long" };
  }

  if (!isValidEmail(email)) {
    return { email: "invalid-email" };
  }

  return {};
}
