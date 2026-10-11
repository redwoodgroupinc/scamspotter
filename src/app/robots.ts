import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

// Generated once at build time (also required for static export).
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  // Keep Vercel preview deployments out of search results.
  if (process.env.VERCEL_ENV === "preview") {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
