import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdSlot } from "@/components/ads/AdSlot";

afterEach(() => {
  vi.unstubAllEnvs();
  delete window.adsbygoogle;
});

describe("AdSlot", () => {
  it("renders nothing (not even an empty container) without configuration", () => {
    const { container } = render(<AdSlot placement="article" />);
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing when the slot for that placement is missing", () => {
    vi.stubEnv("NEXT_PUBLIC_ADSENSE_CLIENT", "ca-pub-1234567890123456");
    vi.stubEnv("NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE", "1234567890");
    const { container } = render(<AdSlot placement="tool" />);
    expect(container.innerHTML).toBe("");
  });

  it("renders one labelled responsive unit when configured", () => {
    vi.stubEnv("NEXT_PUBLIC_ADSENSE_CLIENT", "ca-pub-1234567890123456");
    vi.stubEnv("NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE", "1234567890");
    const { container, getByText } = render(<AdSlot placement="article" />);
    const unit = container.querySelector("ins.adsbygoogle");
    expect(unit?.getAttribute("data-ad-client")).toBe("ca-pub-1234567890123456");
    expect(unit?.getAttribute("data-ad-slot")).toBe("1234567890");
    expect(getByText("Advertisement")).toBeInTheDocument();
    expect(window.adsbygoogle).toHaveLength(1);
  });
});
