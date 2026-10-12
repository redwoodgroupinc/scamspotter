import { expect, test } from "@playwright/test";

const PAGES = [
  "/",
  "/message-checker",
  "/email-checker",
  "/job-scam-checker",
  "/website-safety-guide",
  "/phone-scam-checker",
  "/guides",
  "/guides/how-to-recognize-a-scam-text",
  "/guides/how-to-identify-a-fake-job-offer",
  "/guides/how-to-recognize-phishing-emails",
  "/guides/how-to-verify-a-suspicious-website",
  "/guides/what-to-do-after-a-suspicious-message",
  "/guides/online-shopping-scam-warning-signs",
  "/guides/gift-card-and-cryptocurrency-payment-scams",
  "/guides/how-to-verify-a-message-from-your-bank",
  "/scam-prevention",
  "/scam-prevention/united-states",
  "/scam-prevention/united-kingdom",
  "/scam-prevention/canada",
  "/scam-prevention/australia",
  "/about",
  "/contact",
  "/privacy-policy",
  "/terms",
  "/disclaimer",
  "/editorial-policy",
  "/how-it-works",
];

test.describe("every page", () => {
  for (const path of PAGES) {
    test(`${path} renders with one h1, metadata and no errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      expect((await page.title()).length).toBeGreaterThan(10);
      const description = await page.locator('meta[name="description"]').getAttribute("content");
      expect(description?.length ?? 0).toBeGreaterThan(50);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(canonical).toBe(`https://scamspotter.net${path === "/" ? "" : path}`);
      await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
      await expect(page.locator("header nav, header button")).not.toHaveCount(0);
      await expect(page.locator("footer")).toBeVisible();
      expect(errors).toEqual([]);
    });
  }

  test("titles and descriptions are unique", async ({ request }) => {
    const titles = new Set<string>();
    const descriptions = new Set<string>();
    for (const path of PAGES) {
      const html = await (await request.get(path)).text();
      titles.add(html.match(/<title>([^<]+)<\/title>/)?.[1] ?? path);
      descriptions.add(html.match(/<meta name="description" content="([^"]+)"/)?.[1] ?? path);
    }
    expect(titles.size).toBe(PAGES.length);
    expect(descriptions.size).toBe(PAGES.length);
  });

  test("unknown pages return 404 with helpful links", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  });

  test("serves the Search Console verification file unchanged", async ({ request }) => {
    const response = await request.get("/googlee6481c1a51e79b7a.html");
    expect(response.status()).toBe(200);
    expect(await response.text()).toBe("google-site-verification: googlee6481c1a51e79b7a.html");
  });
});

test.describe("navigation", () => {
  test("desktop header links lead to real pages", async ({ page, isMobile }) => {
    test.skip(isMobile, "Desktop navigation only");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main" });
    for (const label of [
      "Message Checker",
      "Email Checker",
      "Job Scam Checker",
      "Website Safety Guide",
      "Scam Prevention Guides",
      "About",
      "Contact",
    ]) {
      await nav.getByRole("link", { name: label, exact: true }).click();
      await expect(page.locator("h1")).toBeVisible();
      await page.goto("/");
    }
  });

  test("footer links to legal pages work", async ({ page }) => {
    const links: [string, RegExp][] = [
      ["Privacy Policy", /\/privacy-policy$/],
      ["Terms", /\/terms$/],
      ["Disclaimer", /\/disclaimer$/],
      ["Editorial Policy", /\/editorial-policy$/],
      ["How ScamSpotter Works", /\/how-it-works$/],
    ];
    for (const [label, url] of links) {
      await page.goto("/");
      await page.getByRole("contentinfo").getByRole("link", { name: label, exact: true }).click();
      await expect(page).toHaveURL(url);
      await expect(page.locator("h1")).toBeVisible();
    }
  });

  test("mobile menu opens, navigates and closes", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Mobile navigation only");
    await page.goto("/");
    const button = page.getByRole("button", { name: "Menu" });
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await page.getByRole("navigation", { name: "Mobile" }).getByRole("link", { name: "Job Scam Checker" }).click();
    await expect(page).toHaveURL(/\/job-scam-checker$/);
    await expect(page.getByRole("heading", { level: 1, name: "Job Scam Checker" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Mobile" })).toBeHidden();
  });

  test("Escape closes the mobile menu and returns focus", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Mobile navigation only");
    await page.goto("/about");
    const button = page.getByRole("button", { name: "Menu" });
    await button.click();
    await page.keyboard.press("Escape");
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await expect(button).toBeFocused();
  });

  test("skip link moves focus to the main content", async ({ page }) => {
    await page.goto("/guides");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to main content" });
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main-content$/);
  });

  test("breadcrumbs are present on inner pages", async ({ page }) => {
    await page.goto("/guides/how-to-recognize-phishing-emails");
    const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
    await expect(breadcrumb.getByRole("link", { name: "Home" })).toBeVisible();
    await expect(breadcrumb.getByRole("link", { name: "Scam Prevention Guides" })).toBeVisible();
  });
});
