import type { MetadataRoute } from "next";
import { COUNTRIES } from "@/data/countries";
import { getAllGuides } from "@/lib/content/guides";
import { absoluteUrl, SITE, TOOLS } from "@/lib/site";

// Generated once at build time (also required for static export).
export const dynamic = "force-static";

const STATIC_PAGES = [
  "/",
  "/guides",
  "/scam-prevention",
  "/how-it-works",
  "/about",
  "/contact",
  "/editorial-policy",
  "/privacy-policy",
  "/terms",
  "/disclaimer",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const reviewed = new Date(`${SITE.lastReviewed}T00:00:00Z`);
  const pages: MetadataRoute.Sitemap = [
    ...STATIC_PAGES.map((path) => ({ url: absoluteUrl(path), lastModified: reviewed })),
    ...TOOLS.map((tool) => ({ url: absoluteUrl(tool.href), lastModified: reviewed })),
    ...COUNTRIES.map((country) => ({
      url: absoluteUrl(`/scam-prevention/${country.slug}`),
      lastModified: reviewed,
    })),
    ...getAllGuides().map((guide) => ({
      url: absoluteUrl(`/guides/${guide.slug}`),
      lastModified: new Date(`${guide.updated}T00:00:00Z`),
    })),
  ];
  return pages;
}
