import { describe, expect, it } from "vitest";
import { buildContentSecurityPolicy, buildSecurityHeaders } from "@/lib/security/headers";

function header(headers: { key: string; value: string }[], key: string) {
  return headers.find((item) => item.key === key)?.value;
}

describe("security headers", () => {
  it("uses a strict production policy without ads", () => {
    const csp = buildContentSecurityPolicy({ adsEnabled: false, isDev: false });
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-src 'none'");
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).not.toContain("https:");
    expect(csp).not.toContain("upgrade-insecure-requests");
  });

  it("only allows eval and websockets in development", () => {
    const csp = buildContentSecurityPolicy({ adsEnabled: false, isDev: true });
    expect(csp).toContain("'unsafe-eval'");
    expect(csp).toContain("ws:");
  });

  it("widens the policy for HTTPS ad resources only when ads are enabled", () => {
    const csp = buildContentSecurityPolicy({ adsEnabled: true, isDev: false });
    expect(csp).toMatch(/script-src [^;]*https:/);
    expect(csp).toMatch(/frame-src https:/);
    expect(csp).not.toContain("http:");
  });

  it("includes the standard hardening headers", () => {
    const headers = buildSecurityHeaders({ adsEnabled: false, isDev: false, isPreview: false });
    expect(header(headers, "X-Content-Type-Options")).toBe("nosniff");
    expect(header(headers, "X-Frame-Options")).toBe("DENY");
    expect(header(headers, "Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(header(headers, "Strict-Transport-Security")).toContain("max-age=");
    expect(header(headers, "Permissions-Policy")).toContain("camera=()");
    expect(header(headers, "X-Robots-Tag")).toBeUndefined();
  });

  it("keeps preview deployments out of search engines", () => {
    const headers = buildSecurityHeaders({ adsEnabled: false, isDev: false, isPreview: true });
    expect(header(headers, "X-Robots-Tag")).toBe("noindex, nofollow");
  });
});
