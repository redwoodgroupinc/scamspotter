import type { NextConfig } from "next";
import { isValidAdClient } from "./src/lib/ads/config";
import { buildSecurityHeaders } from "./src/lib/security/headers";

/**
 * Static export builds a fully static site into ./out for hosts that serve
 * plain files, such as Cloudflare Workers static assets (see
 * scripts/build-cloudflare.mts). It is on when STATIC_EXPORT=1, and also
 * automatically inside Cloudflare's build environments (Workers Builds sets
 * WORKERS_CI=1, Pages sets CF_PAGES=1), whatever build command is configured.
 * Response headers can't be set by Next.js in that mode, so the build script
 * writes the same headers to out/_headers.
 */
const staticExport =
  process.env.STATIC_EXPORT === "1" || process.env.WORKERS_CI === "1" || process.env.CF_PAGES === "1";

const securityHeaders = buildSecurityHeaders({
  adsEnabled: isValidAdClient(process.env.NEXT_PUBLIC_ADSENSE_CLIENT),
  isDev: process.env.NODE_ENV === "development",
  isPreview: process.env.VERCEL_ENV === "preview",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  ...(staticExport
    ? { output: "export" as const }
    : {
        async headers() {
          return [{ source: "/:path*", headers: securityHeaders }];
        },
      }),
};

export default nextConfig;
