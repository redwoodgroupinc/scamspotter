import { expect, test } from "@playwright/test";

test.describe("core user flows", () => {
  test("homepage checker works with the keyboard only", async ({ page }) => {
    await page.goto("/");
    const textarea = page.getByLabel("Paste a suspicious message");
    await textarea.focus();
    await page.keyboard.type(
      "Your bank account is locked. Send me the verification code now or it will be closed today.",
    );
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Check for Warning Signs" })).toBeFocused();
    await page.keyboard.press("Enter");
    const results = page.getByTestId("checker-results");
    await expect(results).toBeVisible();
    await expect(results.getByText("Asks you to share a verification code")).toBeVisible();
    await expect(page.getByRole("status").filter({ hasText: "Check complete" })).toHaveCount(1);
  });

  test("message checker example, copy and clear", async ({ page, context, browserName }) => {
    test.skip(browserName !== "chromium", "Clipboard permissions are Chromium-specific");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/message-checker");
    await page.getByRole("button", { name: /'Hi Mum' new-number text/ }).click();
    const results = page.getByTestId("checker-results");
    await expect(results.getByText("High: several strong warning signs")).toBeVisible();
    await results.getByRole("button", { name: "Copy results" }).click();
    await expect(page.getByText("Results copied to your clipboard.")).toBeVisible();
    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).toContain("Warning-sign level: High");
    await results.getByRole("button", { name: "Check another message" }).click();
    await expect(page.getByTestId("checker-results")).toHaveCount(0);
    await expect(page.getByLabel("Paste the suspicious message")).toHaveValue("");
  });

  test("empty submission shows an accessible error", async ({ page }) => {
    await page.goto("/job-scam-checker");
    await page.getByRole("button", { name: "Check for Warning Signs" }).click();
    const alert = page.getByRole("alert").filter({ hasText: "Please paste the message" });
    await expect(alert).toBeVisible();
    await expect(page.getByLabel("Paste the job advert, recruiter message or offer")).toBeFocused();
  });

  test("email checker analyses the sender address", async ({ page }) => {
    await page.goto("/email-checker");
    await page
      .getByLabel("Paste the email text")
      .fill("Your mailbox is full. Click here to verify your account within 24 hours.");
    await page.getByLabel(/Sender address/).fill("Microsoft Support <support@micros0ft-help.example>");
    await page.getByRole("button", { name: "Check for Warning Signs" }).click();
    const results = page.getByTestId("checker-results");
    await expect(results.getByRole("heading", { name: "Sender address" })).toBeVisible();
    await expect(results.getByText(/Domain imitates Microsoft/).first()).toBeVisible();
  });

  test("website checker never requests the submitted address", async ({ page }) => {
    const external: string[] = [];
    page.on("request", (request) => {
      if (!request.url().startsWith("http://127.0.0.1")) external.push(request.url());
    });
    await page.goto("/website-safety-guide");
    await page.getByLabel("Web address to check").fill("https://paypal.com.secure-login.example/webscr");
    await page.getByRole("button", { name: "Check This Address" }).click();
    const results = page.getByTestId("checker-results");
    await expect(results.getByText(/Mentions PayPal/)).toBeVisible();
    await expect(results.getByText(/does not visit links/)).toBeVisible();
    expect(external).toEqual([]);
  });

  test("checker text is never placed in the URL", async ({ page }) => {
    await page.goto("/phone-scam-checker");
    await page.getByLabel("Paste or type what the caller said").fill("Press 1 to avoid arrest");
    await page.getByRole("button", { name: "Check for Warning Signs" }).click();
    await expect(page.getByTestId("checker-results")).toBeVisible();
    expect(page.url()).not.toContain("arrest");
    expect(page.url()).not.toContain("?");
  });

  test("results render hostile input as text", async ({ page }) => {
    let dialog = false;
    page.on("dialog", async (event) => {
      dialog = true;
      await event.dismiss();
    });
    await page.goto("/message-checker");
    await page
      .getByLabel("Paste the suspicious message")
      .fill('<img src=x onerror="alert(1)"><script>alert(2)</script> Please send me your password urgently');
    await page.getByRole("button", { name: "Check for Warning Signs" }).click();
    await expect(page.getByTestId("checker-results")).toBeVisible();
    await expect(page.getByTestId("checker-results").locator("img")).toHaveCount(0);
    expect(dialog).toBe(false);
  });
});

test.describe("privacy, ads and SEO", () => {
  test("no ads or third-party scripts load without AdSense configuration", async ({ page }) => {
    const thirdParty: string[] = [];
    page.on("request", (request) => {
      if (!request.url().startsWith("http://127.0.0.1")) thirdParty.push(request.url());
    });
    await page.goto("/");
    await page.goto("/guides/how-to-recognize-a-scam-text");
    await expect(page.locator("ins.adsbygoogle")).toHaveCount(0);
    await expect(page.locator('script[src*="googlesyndication"]')).toHaveCount(0);
    expect(thirdParty).toEqual([]);
  });

  test("security headers are sent", async ({ request }) => {
    const response = await request.get("/");
    const headers = response.headers();
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["x-powered-by"]).toBeUndefined();
  });

  test("robots.txt and sitemap.xml are valid", async ({ request }) => {
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Sitemap: https://scamspotter.net/sitemap.xml");
    const sitemap = await (await request.get("/sitemap.xml")).text();
    for (const path of [
      "/message-checker",
      "/guides/how-to-recognize-a-scam-text",
      "/scam-prevention/australia",
      "/privacy-policy",
    ]) {
      expect(sitemap).toContain(`<loc>https://scamspotter.net${path}</loc>`);
    }
  });

  test("guides include Article and BreadcrumbList structured data", async ({ page }) => {
    await page.goto("/guides/online-shopping-scam-warning-signs");
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const types = blocks.flatMap((block) => {
      const data = JSON.parse(block);
      return (Array.isArray(data) ? data : [data]).map((item) => item["@type"]);
    });
    expect(types).toEqual(expect.arrayContaining(["Article", "BreadcrumbList"]));
    expect(blocks.join(" ")).not.toContain("aggregateRating");
  });
});
