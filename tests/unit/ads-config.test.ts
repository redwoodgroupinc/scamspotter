import { describe, expect, it } from "vitest";
import { isValidAdClient, isValidAdSlot, resolveAdsConfig } from "@/lib/ads/config";

describe("AdSense configuration", () => {
  it("is disabled when nothing is configured", () => {
    expect(resolveAdsConfig({})).toEqual({
      enabled: false,
      client: null,
      slots: { home: null, article: null, tool: null },
    });
  });

  it("rejects placeholder or malformed publisher IDs", () => {
    for (const value of ["", "ca-pub-XXXXXXXXXXXXXXXX", "pub-1234567890123456", "ca-pub-12", "<script>"]) {
      expect(isValidAdClient(value)).toBe(false);
      expect(resolveAdsConfig({ NEXT_PUBLIC_ADSENSE_CLIENT: value }).enabled).toBe(false);
    }
  });

  it("enables ads with a valid publisher ID and ignores invalid slot IDs", () => {
    const config = resolveAdsConfig({
      NEXT_PUBLIC_ADSENSE_CLIENT: "ca-pub-1234567890123456",
      NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE: "1234567890",
      NEXT_PUBLIC_ADSENSE_SLOT_TOOL: "not-a-slot",
    });
    expect(config.enabled).toBe(true);
    expect(config.slots).toEqual({ home: "1234567890", article: "1234567890", tool: null });
  });

  it("uses a dedicated homepage slot when provided", () => {
    const config = resolveAdsConfig({
      NEXT_PUBLIC_ADSENSE_CLIENT: "ca-pub-1234567890123456",
      NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE: "1111111111",
      NEXT_PUBLIC_ADSENSE_SLOT_HOME: "2222222222",
    });
    expect(config.slots.home).toBe("2222222222");
  });

  it("never returns slots without a publisher ID", () => {
    const config = resolveAdsConfig({ NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE: "1234567890" });
    expect(config.slots.article).toBeNull();
    expect(isValidAdSlot("1234567890")).toBe(true);
  });
});

describe("ads.txt", () => {
  it("is only produced for a valid publisher ID", async () => {
    const { buildAdsTxt } = await import("@/lib/ads/config");
    expect(buildAdsTxt(null)).toBeNull();
    expect(buildAdsTxt("ca-pub-XXXX")).toBeNull();
    expect(buildAdsTxt("ca-pub-1234567890123456")).toBe("google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0\n");
  });
});
