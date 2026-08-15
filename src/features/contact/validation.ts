export type ContactFieldName = "name" | "email" | "subject" | "message";

export type ContactFieldErrorCode =
  | "required"
  | "too-short"
  | "too-long"
  | "invalid-email";

export type ContactFieldErrors = Partial<
  Record<ContactFieldName, ContactFieldErrorCode>
>;

export interface ContactSubmissionInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const CONTACT_LIMITS = {
  name: { min: 2, max: 80 },
  email: { min: 1, max: 254 },
  subject: { min: 2, max: 120 },
  message: { min: 10, max: 4000 },
} as const;

function checkLength(
  value: string,
  field: ContactFieldName,
  errors: ContactFieldErrors,
): string {
  const trimmed = value.trim();
  const { min, max } = CONTACT_LIMITS[field];

  if (trimmed.length === 0) {
    errors[field] = "required";
  } else if (trimmed.length < min) {
    errors[field] = "too-short";
  } else if (trimmed.length > max) {
    errors[field] = "too-long";
  }

  return trimmed;
}

function isValidEmail(email: string): boolean {
  if (email.length > CONTACT_LIMITS.email.max) {
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

export function validateContactSubmission(
  input: ContactSubmissionInput,
): ContactFieldErrors {
  const errors: ContactFieldErrors = {};

  checkLength(input.name, "name", errors);
  checkLength(input.subject, "subject", errors);
  checkLength(input.message, "message", errors);

  const email = input.email.trim();
  if (email.length === 0) {
    errors.email = "required";
  } else if (!isValidEmail(email)) {
    errors.email = "invalid-email";
  }

  return errors;
}
