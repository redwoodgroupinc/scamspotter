import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { COUNTRIES } from "@/data/countries";
import { getSource, SOURCES } from "@/data/sources";
import { getAllGuides, GUIDES_DIR, parseGuide } from "@/lib/content/guides";
import { COUNTRY_NAV, LEGAL_NAV, PRIMARY_NAV, TOOLS } from "@/lib/site";

const APP_DIR = path.join(process.cwd(), "src", "app");

/** True when an internal path maps to a real page in the app directory. */
function routeExists(href: string): boolean {
  const [pathname] = href.split("#");
  const clean = (pathname ?? "/").replace(/\/$/, "") || "/";
  if (clean === "/") return fs.existsSync(path.join(APP_DIR, "page.tsx"));
  const guide = clean.match(/^\/guides\/([^/]+)$/);
  if (guide) return getAllGuides().some((item) => item.slug === guide[1]);
  const country = clean.match(/^\/scam-prevention\/([^/]+)$/);
  if (country) return COUNTRIES.some((item) => item.slug === country[1]);
  return fs.existsSync(path.join(APP_DIR, clean, "page.tsx"));
}

describe("source registry", () => {
  it("has unique ids and URLs, all using HTTPS", () => {
    const ids = SOURCES.map((source) => source.id);
    const urls = SOURCES.map((source) => source.url);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(urls).size).toBe(urls.length);
    for (const source of SOURCES) expect(source.url, source.id).toMatch(/^https:\/\//);
  });
});

describe("guides", () => {
  const guides = getAllGuides();

  it("publishes at least the eight core guides", () => {
    expect(guides.length).toBeGreaterThanOrEqual(8);
    for (const slug of [
      "how-to-recognize-a-scam-text",
      "how-to-identify-a-fake-job-offer",
      "how-to-recognize-phishing-emails",
      "how-to-verify-a-suspicious-website",
      "what-to-do-after-a-suspicious-message",
      "online-shopping-scam-warning-signs",
      "gift-card-and-cryptocurrency-payment-scams",
      "how-to-verify-a-message-from-your-bank",
    ]) {
      expect(guides.map((guide) => guide.slug)).toContain(slug);
    }
  });

  it("have unique titles and descriptions", () => {
    expect(new Set(guides.map((guide) => guide.title)).size).toBe(guides.length);
    expect(new Set(guides.map((guide) => guide.description)).size).toBe(guides.length);
  });

  it("are substantial, structured articles", () => {
    for (const guide of guides) {
      const words = guide.body.split(/\s+/).length;
      expect(words, guide.slug).toBeGreaterThan(700);
      expect(guide.headings.length, guide.slug).toBeGreaterThanOrEqual(4);
      expect(guide.sources.length, guide.slug).toBeGreaterThanOrEqual(3);
    }
  });

  it("only link to external URLs that are in the verified source registry", () => {
    const registered = new Set<string>(SOURCES.map((source) => source.url));
    for (const guide of guides) {
      const external = Array.from(guide.body.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g), (match) => match[1]!);
      for (const url of external) expect(registered.has(url), `${guide.slug}: ${url}`).toBe(true);
    }
  });

  it("only link to internal pages that exist", () => {
    for (const guide of guides) {
      const internal = Array.from(guide.body.matchAll(/\]\((\/[^)\s]*)\)/g), (match) => match[1]!);
      for (const href of internal) expect(routeExists(href), `${guide.slug}: ${href}`).toBe(true);
    }
  });

  it("contain no raw HTML", () => {
    for (const guide of guides) expect(guide.body, guide.slug).not.toMatch(/<\/?[a-z][^>]*>/i);
  });

  it("rejects invalid front matter", () => {
    expect(() => parseGuide("bad.md", "no front matter")).toThrow(/front matter/);
    expect(() =>
      parseGuide(
        "bad.md",
        "---\ntitle: T\ndescription: short\nsummary: S\ncategory: C\npublished: 2026-01-01\nupdated: 2026-01-01\nsources: [ftc-phishing]\n---\nBody",
      ),
    ).toThrow(/description/);
    const longDescription = "A".repeat(100);
    expect(() =>
      parseGuide(
        "bad.md",
        `---\ntitle: T\ndescription: ${longDescription}\nsummary: S\ncategory: C\npublished: 2026-01-01\nupdated: 2026-01-01\nsources: [not-a-source]\n---\nBody`,
      ),
    ).toThrow(/unknown source/);
  });

  it("reads every markdown file in the content directory", () => {
    const files = fs.readdirSync(GUIDES_DIR).filter((file) => file.endsWith(".md"));
    expect(files.length).toBe(guides.length);
  });
});

describe("country pages", () => {
  it("cover the four target markets with the right currencies", () => {
    expect(COUNTRIES.map((country) => [country.code, country.currency.code])).toEqual([
      ["us", "USD"],
      ["uk", "GBP"],
      ["ca", "CAD"],
      ["au", "AUD"],
    ]);
  });

  it("reference only registered sources", () => {
    for (const country of COUNTRIES) {
      const ids = [
        ...country.sources,
        ...country.reporting.map((item) => item.source),
        ...country.officialStatements.map((item) => item.source),
      ];
      for (const id of ids) expect(getSource(id), `${country.slug}: ${id}`).toBeDefined();
    }
  });

  it("have genuinely distinct content", () => {
    const intros = COUNTRIES.map((country) => country.intro.join(" "));
    expect(new Set(intros).size).toBe(COUNTRIES.length);
    const reportingNames = COUNTRIES.map((country) => country.reporting.map((item) => item.name).join("|"));
    expect(new Set(reportingNames).size).toBe(COUNTRIES.length);
    for (const country of COUNTRIES) {
      expect(country.reporting.length).toBeGreaterThanOrEqual(4);
      expect(country.officialStatements.length).toBeGreaterThanOrEqual(3);
      expect(country.scams.length).toBeGreaterThanOrEqual(3);
      expect(country.illustration.message).toContain(".example");
    }
  });

  it("mention the replacement of Action Fraud by Report Fraud", () => {
    const uk = COUNTRIES.find((country) => country.code === "uk")!;
    expect(JSON.stringify(uk)).toContain("Report Fraud");
    expect(uk.intro.join(" ")).toMatch(/replaced Action Fraud/);
  });
});

describe("navigation", () => {
  it("every navigation link leads to an implemented page", () => {
    const links = [...PRIMARY_NAV, ...LEGAL_NAV, ...COUNTRY_NAV, ...TOOLS.map((tool) => ({ href: tool.href }))];
    for (const link of links) expect(routeExists(link.href), link.href).toBe(true);
  });

  it("includes every navigation item required by the brief", () => {
    const labels = [...PRIMARY_NAV, ...LEGAL_NAV].map((link) => link.label);
    for (const label of [
      "Home",
      "Message Checker",
      "Email Checker",
      "Job Scam Checker",
      "Website Safety Guide",
      "Scam Prevention Guides",
      "About",
      "Contact",
      "Privacy Policy",
      "Terms",
      "Disclaimer",
    ]) {
      expect(labels).toContain(label);
    }
  });

  it("has the required standalone pages", () => {
    for (const route of [
      "/about",
      "/contact",
      "/privacy-policy",
      "/terms",
      "/disclaimer",
      "/editorial-policy",
      "/how-it-works",
      "/guides",
      "/phone-scam-checker",
    ]) {
      expect(routeExists(route), route).toBe(true);
    }
  });
});
