import { describe, expect, it } from "vitest";
import { buildHeadersFile, buildNetlifyRedirects } from "@/lib/security/static-host-files";

describe("_headers file", () => {
  const file = buildHeadersFile({ adsEnabled: false, host: "cloudflare" });
  const netlify = buildHeadersFile({ adsEnabled: false, host: "netlify" });

  it("applies the security headers to every path", () => {
    for (const output of [file, netlify]) {
      const block = output.split("\n\n").find((section) => section.startsWith("/*"))!;
      expect(block).toContain("  Content-Security-Policy: default-src 'self';");
      expect(block).toContain("  X-Frame-Options: DENY");
      expect(block).toContain("  X-Content-Type-Options: nosniff");
      expect(block).toContain("  Strict-Transport-Security: max-age=31536000; includeSubDomains");
      expect(block).not.toContain("X-Robots-Tag");
    }
  });

  it("caches hashed Next.js assets for a year", () => {
    for (const output of [file, netlify]) {
      expect(output).toContain("/_next/static/*\n  Cache-Control: public, max-age=31536000, immutable");
    }
  });

  it("keeps workers.dev addresses out of search engines on Cloudflare only", () => {
    expect(file).toContain("https://:worker.:subdomain.workers.dev/*\n  X-Robots-Tag: noindex, nofollow");
    expect(netlify).not.toContain("workers.dev");
  });

  it("uses the expected format (pattern line, then indented headers)", () => {
    for (const output of [file, netlify]) {
      for (const line of output.split("\n")) {
        if (line === "" || line.startsWith("#")) continue;
        expect(line.startsWith("/") || line.startsWith("https://") || /^ {2}[A-Za-z-]+: \S/.test(line), line).toBe(
          true,
        );
      }
    }
  });

  it("widens the CSP only when ads are enabled", () => {
    expect(file).not.toMatch(/script-src [^;\n]*https:/);
    expect(buildHeadersFile({ adsEnabled: true, host: "netlify" })).toMatch(/script-src [^;\n]*https:/);
  });
});

describe("Netlify _redirects file", () => {
  const file = buildNetlifyRedirects([
    "index.html",
    "404.html",
    "_not-found.html",
    "about.html",
    "guides.html",
    "guides/how-to-recognize-a-scam-text.html",
    "scam-prevention\\canada.html",
    "about/__next._tree.txt",
  ]);
  const rules = file.split("\n").filter((line) => line && !line.startsWith("#"));

  it("rewrites each clean URL to its HTML file with a 200", () => {
    expect(rules).toEqual([
      "/about /about.html 200",
      "/guides /guides.html 200",
      "/guides/how-to-recognize-a-scam-text /guides/how-to-recognize-a-scam-text.html 200",
      "/scam-prevention/canada /scam-prevention/canada.html 200",
    ]);
  });

  it("leaves the home page and error pages to the host", () => {
    expect(file).not.toMatch(/\/index\.html|404|not-found/);
  });
});
