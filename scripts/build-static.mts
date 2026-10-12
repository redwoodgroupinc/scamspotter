/**
 * Builds ScamSpotter as a fully static site for Cloudflare or Netlify.
 *
 *   npm run build:cloudflare   ->  ./out   (deploy with `npx wrangler deploy`)
 *   npm run build:netlify      ->  ./out   (deploy with `npx netlify-cli deploy --prod --dir out`)
 *
 * 1. Runs `next build` with STATIC_EXPORT=1 (output: "export").
 * 2. Writes out/_headers with the site's security headers (and, on Netlify,
 *    out/_redirects so clean URLs such as /about serve about.html).
 * 3. Publishes /ads.txt only when a valid AdSense publisher ID is configured.
 * 4. Checks that the files the host needs are present.
 *
 * With --postbuild it only does steps 2-4. `npm run build` runs it that way
 * automatically (the "postbuild" npm script), and it does nothing unless the
 * build was a static export, which next.config.ts switches on automatically
 * inside Cloudflare's and Netlify's build environments. So a project whose
 * build command is `npm run build` still produces a complete ./out folder.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { buildAdsTxt, isValidAdClient } from "../src/lib/ads/config";
import { buildHeadersFile, buildNetlifyRedirects, type StaticHost } from "../src/lib/security/static-host-files";

const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "out");

function fail(message: string): never {
  console.error(`\n✗ ${message}`);
  process.exit(1);
}

const postbuildOnly = process.argv.includes("--postbuild");
function resolveHost(): StaticHost {
  const arg = process.argv.find((value) => value.startsWith("--host="))?.slice("--host=".length);
  if (arg === "cloudflare" || arg === "netlify") return arg;
  if (arg !== undefined) fail(`Unknown --host "${arg}". Use --host=cloudflare or --host=netlify.`);
  return process.env.NETLIFY === "true" ? "netlify" : "cloudflare";
}

const host = resolveHost();
const hostBuildEnv = process.env.WORKERS_CI === "1" || process.env.CF_PAGES === "1" || process.env.NETLIFY === "true";

if (postbuildOnly) {
  // Plain `npm run build` outside a static host: nothing to do.
  if (process.env.STATIC_EXPORT !== "1" && !hostBuildEnv) process.exit(0);
} else {
  fs.rmSync(outDir, { recursive: true, force: true });
  const nextBin = createRequire(import.meta.url).resolve("next/dist/bin/next");
  const build = spawnSync(process.execPath, [nextBin, "build"], {
    cwd: root,
    stdio: "inherit",
    env: { SITE_HOST: host, ...process.env, STATIC_EXPORT: "1", NEXT_TELEMETRY_DISABLED: "1" },
  });
  if (build.status !== 0) fail(`next build failed with exit code ${build.status}`);
}

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

fs.writeFileSync(path.join(outDir, "_headers"), buildHeadersFile({ adsEnabled, host }));

const listHtml = (dir: string) =>
  fs.existsSync(dir)
    ? fs
        .readdirSync(dir, { recursive: true })
        .map(String)
        .filter((file) => file.endsWith(".html"))
    : [];
const htmlFiles = listHtml(outDir);
// Files copied from public/ (such as the Search Console verification file) are served as-is.
const publicFiles = new Set(listHtml(path.join(root, "public")));
const redirectsPath = path.join(outDir, "_redirects");
if (host === "netlify") {
  fs.writeFileSync(redirectsPath, buildNetlifyRedirects(htmlFiles.filter((file) => !publicFiles.has(file))));
} else {
  fs.rmSync(redirectsPath, { force: true });
}

console.log(`\n✓ Static site ready in ./out (${htmlFiles.length} HTML files, for ${host})`);
console.log(`  _headers:   written${adsEnabled ? " (AdSense enabled)" : ""}`);
if (host === "netlify") console.log("  _redirects: written (clean URLs)");
console.log(`  ads.txt:    ${adsTxt ? "published" : "not published (no AdSense publisher ID configured)"}`);
console.log(`  Deploy with: ${host === "netlify" ? "npx netlify-cli deploy --prod --dir out" : "npx wrangler deploy"}`);
