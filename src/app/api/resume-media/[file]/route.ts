import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";

import { siteConfig } from "@/content/site-config";
import type { SectionPublicity } from "@/content/site-config";

const resumeMediaRoot = join(process.cwd(), "private-assets", "resume");

const approvedMediaFiles = [
  "bachelor-degree.jpg",
  "bachelor-degree-thumb.jpg",
  "toeic.jpg",
  "toeic-thumb.jpg",
  "basic-it-application.jpg",
  "basic-it-application-thumb.jpg",
  "transcript.jpg",
  "transcript-thumb.jpg",
  "englishwing-employment.jpg",
  "englishwing-employment-thumb.jpg",
] as const;

const DENIED_RESPONSE_HEADERS: Readonly<Record<string, string>> = {
  "Cache-Control": "no-store",
};

interface ResumeMediaRouteContext {
  params: Promise<{ file: string }>;
}

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: ResumeMediaRouteContext,
) {
  const publicity: SectionPublicity = siteConfig.sections.resume.publicity;
  if (publicity !== "visible") {
    return new NextResponse("Resume is private", {
      status: 404,
      headers: DENIED_RESPONSE_HEADERS,
    });
  }

  const { file } = await context.params;

  if (!(approvedMediaFiles as readonly string[]).includes(file)) {
    return new NextResponse("Not found", {
      status: 404,
      headers: DENIED_RESPONSE_HEADERS,
    });
  }

  try {
    const bytes = await readFile(join(resumeMediaRoot, file));
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "image/jpeg",
      },
    });
  } catch {
    return new NextResponse("Not found", {
      status: 404,
      headers: DENIED_RESPONSE_HEADERS,
    });
  }
}

