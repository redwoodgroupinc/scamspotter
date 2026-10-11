/**
 * Which hosting provider serves the site, so the privacy policy can name it
 * accurately. Detected at build time from the variables each platform sets
 * in its build environment; SITE_HOST overrides the detection.
 */

export type HostingProviderId = "netlify" | "cloudflare" | "vercel";

export interface HostingProvider {
  id: HostingProviderId;
  name: string;
  privacyUrl: string;
}

const PROVIDERS: Record<HostingProviderId, HostingProvider> = {
  netlify: { id: "netlify", name: "Netlify", privacyUrl: "https://www.netlify.com/privacy/" },
  cloudflare: { id: "cloudflare", name: "Cloudflare", privacyUrl: "https://www.cloudflare.com/privacypolicy/" },
  vercel: { id: "vercel", name: "Vercel", privacyUrl: "https://vercel.com/legal/privacy-notice" },
};

type Env = Record<string, string | undefined>;

export function resolveHostingProvider(env: Env): HostingProvider | null {
  const explicit = env.SITE_HOST?.trim().toLowerCase();
  if (explicit && explicit in PROVIDERS) return PROVIDERS[explicit as HostingProviderId];
  if (env.NETLIFY === "true") return PROVIDERS.netlify;
  if (env.WORKERS_CI === "1" || env.CF_PAGES === "1") return PROVIDERS.cloudflare;
  if (env.VERCEL === "1") return PROVIDERS.vercel;
  return null;
}

export function getHostingProvider(): HostingProvider | null {
  return resolveHostingProvider(process.env);
}
