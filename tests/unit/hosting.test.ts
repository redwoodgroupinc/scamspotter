import { describe, expect, it } from "vitest";
import { resolveHostingProvider } from "@/lib/hosting";

describe("resolveHostingProvider", () => {
  it("detects each platform's build environment", () => {
    expect(resolveHostingProvider({ NETLIFY: "true" })?.name).toBe("Netlify");
    expect(resolveHostingProvider({ WORKERS_CI: "1" })?.name).toBe("Cloudflare");
    expect(resolveHostingProvider({ CF_PAGES: "1" })?.name).toBe("Cloudflare");
    expect(resolveHostingProvider({ VERCEL: "1" })?.name).toBe("Vercel");
  });

  it("lets SITE_HOST override detection", () => {
    expect(resolveHostingProvider({ SITE_HOST: "Cloudflare", NETLIFY: "true" })?.id).toBe("cloudflare");
  });

  it("ignores unknown values and returns null when nothing is detected", () => {
    expect(resolveHostingProvider({ SITE_HOST: "somewhere-else" })).toBeNull();
    expect(resolveHostingProvider({})).toBeNull();
  });

  it("links each provider to an https privacy policy", () => {
    for (const env of [{ NETLIFY: "true" }, { WORKERS_CI: "1" }, { VERCEL: "1" }]) {
      expect(resolveHostingProvider(env)?.privacyUrl).toMatch(/^https:\/\//);
    }
  });
});
