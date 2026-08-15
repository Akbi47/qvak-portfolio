const IPV4_PATTERN = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
const IPV6_PATTERN = /^[0-9a-fA-F:]+$/;

function stripPort(value: string): string {
  if (value.startsWith("[")) {
    const close = value.indexOf("]");
    if (close > 0) {
      return value.slice(1, close);
    }
  }

  if (value.includes(".")) {
    return value.split(":")[0];
  }

  return value;
}

/**
 * Extracts a conservative client identifier from the platform-provided
 * forwarded client-IP header.
 *
 * Assumption (Vercel-specific): on Vercel, `x-forwarded-for` is set by
 * the platform to the client's address. This code intentionally does not
 * trust arbitrary user-controlled header values beyond the platform's
 * behavior, and fails closed (returns null) for anything it cannot
 * confidently interpret.
 */
export function extractClientIdentifier(
  forwardedFor: string | undefined,
): string | null {
  if (!forwardedFor) {
    return null;
  }

  const first = forwardedFor.split(",")[0].trim();
  if (first.length === 0) {
    return null;
  }

  const candidate = stripPort(first);
  if (IPV4_PATTERN.test(candidate) || IPV6_PATTERN.test(candidate)) {
    return candidate;
  }

  return null;
}
