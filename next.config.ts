import type { NextConfig } from "next";
import { isValidAdClient } from "./src/lib/ads/config";
import { buildSecurityHeaders } from "./src/lib/security/headers";

const securityHeaders = buildSecurityHeaders({
  adsEnabled: isValidAdClient(process.env.NEXT_PUBLIC_ADSENSE_CLIENT),
  isDev: process.env.NODE_ENV === "development",
  isPreview: process.env.VERCEL_ENV === "preview",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
