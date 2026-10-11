import type { NextConfig } from "next";
import { isValidAdClient } from "./src/lib/ads/config";
import { buildSecurityHeaders } from "./src/lib/security/headers";

/**
 * STATIC_EXPORT=1 builds a fully static site into ./out for hosts that serve
 * plain files, such as Cloudflare Workers static assets (see
 * scripts/build-cloudflare.ts). Response headers can't be set by Next.js in
 * that mode, so the build script writes the same headers to out/_headers.
 */
const staticExport = process.env.STATIC_EXPORT === "1";

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
