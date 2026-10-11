/**
 * Builds ScamSpotter as a fully static site for Cloudflare.
 *
 *   npm run build:cloudflare   ->  ./out   (deploy with `npx wrangler deploy`)
 *
 * 1. Runs `next build` with STATIC_EXPORT=1 (output: "export").
 * 2. Writes out/_headers with the site's security headers.
 * 3. Publishes /ads.txt only when a valid AdSense publisher ID is configured.
 * 4. Checks that the files Cloudflare needs are present.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { buildAdsTxt, isValidAdClient } from "../src/lib/ads/config";
import { buildCloudflareHeaders } from "../src/lib/security/cloudflare-headers";

const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "out");

function fail(message: string): never {
  console.error(`\n✗ ${message}`);
  process.exit(1);
}

fs.rmSync(outDir, { recursive: true, force: true });

const nextBin = createRequire(import.meta.url).resolve("next/dist/bin/next");
const build = spawnSync(process.execPath, [nextBin, "build"], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, STATIC_EXPORT: "1", NEXT_TELEMETRY_DISABLED: "1" },
});
if (build.status !== 0) fail(`next build failed with exit code ${build.status}`);

for (const file of ["index.html", "404.html", "robots.txt", "sitemap.xml", "manifest.webmanifest"]) {
  if (!fs.existsSync(path.join(outDir, file))) fail(`Expected out/${file} after the static export.`);
}

const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
const adsEnabled = isValidAdClient(client);
const adsTxt = buildAdsTxt(adsEnabled ? client.trim() : null);
const adsTxtPath = path.join(outDir, "ads.txt");
if (adsTxt) {
  fs.writeFileSync(adsTxtPath, adsTxt);
} else {
  fs.rmSync(adsTxtPath, { force: true });
}

fs.writeFileSync(path.join(outDir, "_headers"), buildCloudflareHeaders({ adsEnabled }));

const pages = fs.readdirSync(outDir, { recursive: true }).filter((file) => String(file).endsWith(".html")).length;
console.log(`\n✓ Static site ready in ./out (${pages} HTML files)`);
console.log(`  _headers: written${adsEnabled ? " (AdSense enabled)" : ""}`);
console.log(`  ads.txt:  ${adsTxt ? "published" : "not published (no AdSense publisher ID configured)"}`);
console.log("  Deploy with: npx wrangler deploy");
