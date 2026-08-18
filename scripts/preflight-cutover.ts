import { argv, env, exit } from "node:process";

const DEFAULT_ORIGIN = "https://quachvoanhkhoa.feaon.com";

type Severity = "fail" | "info";

interface CheckResult {
  name: string;
  pass: boolean;
  severity: Severity;
  detail?: string;
}

const results: CheckResult[] = [];

function record(
  name: string,
  pass: boolean,
  severity: Severity,
  detail?: string,
): void {
  results.push({ name, pass, severity, detail });
}

async function runCheck(
  name: string,
  fn: () => Promise<{ pass: boolean; detail?: string }>,
  severity: Severity = "fail",
): Promise<void> {
  try {
    const outcome = await fn();
    record(name, outcome.pass, severity, outcome.detail);
  } catch (error) {
    record(
      name,
      false,
      severity,
      error instanceof Error ? error.message : String(error),
    );
  }
}

async function fetchText(
  url: string,
  init?: RequestInit,
): Promise<{ status: number; text: string }> {
  const response = await fetch(url, init);
  return { status: response.status, text: await response.text() };
}

async function checkRoots(origin: string): Promise<void> {
  const roots: ReadonlyArray<[string, string]> = [
    ["en root", "/"],
    ["vi root", "/vi"],
  ];

  for (const [label, pathname] of roots) {
    await runCheck(`${label} returns 200`, async () => {
      const { status } = await fetchText(`${origin}${pathname}`);
      return { pass: status === 200, detail: `status ${status}` };
    });
  }
}

const legacyRedirectChecks: ReadonlyArray<{
  pathname: string;
  expectedLocation: string;
}> = [
  { pathname: "/resume/", expectedLocation: "/#resume" },
  { pathname: "/case-studies/", expectedLocation: "/#projects" },
  { pathname: "/atm-seeking/", expectedLocation: "/#projects" },
  { pathname: "/vi/case-studies/", expectedLocation: "/vi#projects" },
  { pathname: "/blog/", expectedLocation: "/" },
  { pathname: "/blocks/footer/", expectedLocation: "/" },
  { pathname: "/tag/nextjs/", expectedLocation: "/" },
];

async function checkLegacyRedirects(origin: string): Promise<void> {
  for (const check of legacyRedirectChecks) {
    await runCheck(
      `legacy redirect ${check.pathname} -> ${check.expectedLocation}`,
      async () => {
        const response = await fetch(`${origin}${check.pathname}`, {
          redirect: "manual",
        });
        const rawLocation = response.headers.get("location") ?? "";
        const location = rawLocation.startsWith(origin)
          ? rawLocation.slice(origin.length)
          : rawLocation;
        return {
          pass: response.status === 301 && location === check.expectedLocation,
          detail: `status ${response.status}, location ${rawLocation || "none"}`,
        };
      },
    );
  }
}

function hrefInLink(
  html: string,
  options: { rel?: string; hreflang?: string },
): string | null {
  const linkPattern = /<link\b[^>]*>/gi;
  let match: RegExpExecArray | null;

  while ((match = linkPattern.exec(html)) !== null) {
    const tag = match[0];
    const hasRel =
      options.rel === undefined ||
      new RegExp(`rel=["']${options.rel}["']`, "i").test(tag);
    const hasHreflang =
      options.hreflang === undefined ||
      new RegExp(`hreflang=["']${options.hreflang}["']`, "i").test(tag);

    if (hasRel && hasHreflang) {
      return tag.match(/href=["']([^"']+)["']/i)?.[1] ?? null;
    }
  }

  return null;
}

function isAbsoluteHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

async function checkMetadata(origin: string): Promise<void> {
  let status: number;
  let text: string;
  try {
    const page = await fetchText(`${origin}/`);
    status = page.status;
    text = page.text;
  } catch (error) {
    record(
      "metadata: homepage fetch",
      false,
      "fail",
      error instanceof Error ? error.message : String(error),
    );
    return;
  }

  const pageOk = status === 200;

  record(
    "metadata: title present",
    pageOk && /<title[^>]*>[\s\S]*?<\/title>/i.test(text),
    "fail",
    pageOk ? undefined : `status ${status}`,
  );

  const canonical = hrefInLink(text, { rel: "canonical" });
  record(
    "metadata: canonical href is an absolute root URL",
    pageOk &&
      canonical !== null &&
      isAbsoluteHref(canonical) &&
      new URL(canonical).pathname === "/",
    "fail",
    pageOk
      ? `href ${canonical ?? "missing"}`
      : `status ${status}`,
  );

  for (const locale of ["en", "vi", "x-default"]) {
    const href = hrefInLink(text, { rel: "alternate", hreflang: locale });
    record(
      `metadata: hreflang "${locale}" has an absolute href`,
      pageOk && href !== null && isAbsoluteHref(href),
      "fail",
      pageOk ? `href ${href ?? "missing"}` : `status ${status}`,
    );
  }
}

async function checkSitemapAndRobots(origin: string): Promise<void> {
  await runCheck("/sitemap.xml returns 200 with https urlset", async () => {
    const { status, text } = await fetchText(`${origin}/sitemap.xml`);
    return {
      pass: status === 200 && text.includes("<urlset") && /https:\/\//.test(text),
      detail: `status ${status}, urlset ${text.includes("<urlset")}`,
    };
  });

  await runCheck("/robots.txt returns 200 with sitemap reference", async () => {
    const { status, text } = await fetchText(`${origin}/robots.txt`);
    return {
      pass: status === 200 && /sitemap:/i.test(text),
      detail: `status ${status}`,
    };
  });
}

async function checkPublicAsset(origin: string): Promise<void> {
  await runCheck("public image asset loads", async () => {
    const response = await fetch(
      `${origin}/images/profile/portrait-hero-banner.jpg`,
    );
    return {
      pass: response.status === 200,
      detail: `status ${response.status}`,
    };
  });
}

async function checkResumePublicity(origin: string): Promise<void> {
  try {
    const response = await fetch(
      `${origin}/api/resume-media/transcript.jpg`,
      { redirect: "manual" },
    );
    const ok = response.status === 404 || response.status === 200;
    record(
      "resume-media gate behaves (404 private / 200 visible)",
      ok,
      response.status >= 500 ? "fail" : "info",
      `status ${response.status}`,
    );
  } catch (error) {
    record(
      "resume-media gate behaves (404 private / 200 visible)",
      false,
      "fail",
      error instanceof Error ? error.message : String(error),
    );
  }
}

async function checkContact(origin: string): Promise<void> {
  await runCheck("contact section renders on the homepage", async () => {
    const { status, text } = await fetchText(`${origin}/`);
    return {
      pass: status === 200 && text.includes('id="contact"'),
      detail: `status ${status}`,
    };
  });
}

function printSummary(origin: string): void {
  const failures = results.filter(
    (result) => !result.pass && result.severity === "fail",
  );
  const warnings = results.filter(
    (result) => !result.pass && result.severity === "info",
  );
  const passed = results.filter((result) => result.pass).length;

  console.log(`\nPreflight report for ${origin}\n`);

  for (const result of results) {
    const label = result.pass
      ? "PASS"
      : result.severity === "info"
        ? "WARN"
        : "FAIL";
    console.log(
      `  [${label}] ${result.name}${result.detail ? ` — ${result.detail}` : ""}`,
    );
  }

  console.log(
    `\n${passed}/${results.length} checks passed, ${warnings.length} warnings, ${failures.length} failed.`,
  );

  if (failures.length > 0) {
    console.error("\nPreflight FAILED. Resolve the failures before cutover.");
  } else {
    console.log(
      "\nPreflight passed. Review warnings and complete the manual gates before cutover.",
    );
  }
}

async function main(): Promise<void> {
  const originArg = argv
    .map((arg) => arg.match(/^--origin=(.+)$/)?.[1])
    .find((value) => value !== undefined);
  const origin = (
    originArg ??
    env.PREFLIGHT_ORIGIN ??
    DEFAULT_ORIGIN
  ).replace(/\/+$/, "");

  await checkRoots(origin);
  await checkLegacyRedirects(origin);
  await checkMetadata(origin);
  await checkSitemapAndRobots(origin);
  await checkPublicAsset(origin);
  await checkResumePublicity(origin);
  await checkContact(origin);

  printSummary(origin);

  const failures = results.filter(
    (result) => !result.pass && result.severity === "fail",
  );
  if (failures.length > 0) {
    exit(1);
  }
}

main().catch((error: unknown) => {
  console.error("Preflight crashed:", error);
  exit(1);
});