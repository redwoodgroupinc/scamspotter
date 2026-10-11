import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3100);
const baseURL = `http://127.0.0.1:${PORT}`;

/**
 * End-to-end tests run against a production build.
 *
 * - Default: `npm run build`, then tests run against `next start`.
 * - E2E_TARGET=cloudflare: `npm run build:cloudflare`, then tests run against
 *   Wrangler's local server, which serves ./out in Cloudflare's workerd runtime.
 *
 * Set PLAYWRIGHT_CHROMIUM_PATH to use a pre-installed Chromium binary.
 */
const cloudflare = process.env.E2E_TARGET === "cloudflare";
const serverCommand = cloudflare
  ? `npx wrangler dev --port ${PORT} --ip 127.0.0.1`
  : `npx next start --port ${PORT} --hostname 127.0.0.1`;
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop-chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: process.env.PLAYWRIGHT_CHROMIUM_PATH
          ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
          : {},
      },
    },
    {
      name: "mobile-chromium",
      use: {
        ...devices["Pixel 7"],
        launchOptions: process.env.PLAYWRIGHT_CHROMIUM_PATH
          ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
          : {},
      },
    },
  ],
  webServer: {
    command: serverCommand,
    env: { WRANGLER_SEND_METRICS: "false" },
    url: baseURL,
    // Always start a fresh server so tests run against the current build.
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
