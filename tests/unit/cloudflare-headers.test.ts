import { describe, expect, it } from "vitest";
import { buildCloudflareHeaders } from "@/lib/security/cloudflare-headers";

describe("Cloudflare _headers file", () => {
  const file = buildCloudflareHeaders({ adsEnabled: false });

  it("applies the security headers to every path", () => {
    const block = file.split("\n\n").find((section) => section.startsWith("/*"))!;
    expect(block).toContain("  Content-Security-Policy: default-src 'self';");
    expect(block).toContain("  X-Frame-Options: DENY");
    expect(block).toContain("  X-Content-Type-Options: nosniff");
    expect(block).toContain("  Strict-Transport-Security: max-age=31536000; includeSubDomains");
    expect(block).not.toContain("X-Robots-Tag");
  });

  it("caches hashed Next.js assets for a year", () => {
    expect(file).toContain("/_next/static/*\n  Cache-Control: public, max-age=31536000, immutable");
  });

  it("keeps workers.dev addresses out of search engines", () => {
    expect(file).toContain("https://:worker.:subdomain.workers.dev/*\n  X-Robots-Tag: noindex, nofollow");
  });

  it("uses the format Cloudflare expects (pattern line, then indented headers)", () => {
    for (const line of file.split("\n")) {
      if (line === "" || line.startsWith("#")) continue;
      expect(line.startsWith("/") || line.startsWith("https://") || /^ {2}[A-Za-z-]+: \S/.test(line), line).toBe(true);
    }
  });

  it("widens the CSP only when ads are enabled", () => {
    expect(file).not.toMatch(/script-src [^;\n]*https:/);
    expect(buildCloudflareHeaders({ adsEnabled: true })).toMatch(/script-src [^;\n]*https:/);
  });
});
