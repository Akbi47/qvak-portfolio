import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,
  outputFileTracingIncludes: {
    "/api/resume-media/[file]": ["./private-assets/resume/**/*"],
  },
};

export default nextConfig;