/**
 * Google AdSense configuration, read from public environment variables.
 *
 * Nothing here is hardcoded: until a real publisher ID and ad unit IDs are
 * configured, `getAdsConfig()` reports ads as disabled and no AdSense script
 * or ad container is rendered anywhere on the site.
 */

export type AdPlacement = "home" | "article" | "tool";

export interface AdsConfig {
  enabled: boolean;
  client: string | null;
  slots: Record<AdPlacement, string | null>;
}

const CLIENT_PATTERN = /^ca-pub-\d{10,20}$/;
const SLOT_PATTERN = /^\d{6,20}$/;

export function isValidAdClient(value: string | undefined | null): value is string {
  return typeof value === "string" && CLIENT_PATTERN.test(value.trim());
}

export function isValidAdSlot(value: string | undefined | null): value is string {
  return typeof value === "string" && SLOT_PATTERN.test(value.trim());
}

function cleanSlot(value: string | undefined): string | null {
  return isValidAdSlot(value) ? value.trim() : null;
}

export interface AdsEnv {
  NEXT_PUBLIC_ADSENSE_CLIENT?: string;
  NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE?: string;
  NEXT_PUBLIC_ADSENSE_SLOT_TOOL?: string;
  NEXT_PUBLIC_ADSENSE_SLOT_HOME?: string;
}

export function resolveAdsConfig(env: AdsEnv): AdsConfig {
  const rawClient = env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const client = isValidAdClient(rawClient) ? rawClient.trim() : null;
  const article = cleanSlot(env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE);
  const tool = cleanSlot(env.NEXT_PUBLIC_ADSENSE_SLOT_TOOL);
  const home = cleanSlot(env.NEXT_PUBLIC_ADSENSE_SLOT_HOME) ?? article;

  return {
    enabled: client !== null,
    client,
    slots: {
      home: client ? home : null,
      article: client ? article : null,
      tool: client ? tool : null,
    },
  };
}

/**
 * NEXT_PUBLIC_* variables must be referenced literally so Next.js can inline
 * them into client bundles at build time.
 */
export function getAdsConfig(): AdsConfig {
  return resolveAdsConfig({
    NEXT_PUBLIC_ADSENSE_CLIENT: process.env.NEXT_PUBLIC_ADSENSE_CLIENT,
    NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE: process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE,
    NEXT_PUBLIC_ADSENSE_SLOT_TOOL: process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOOL,
    NEXT_PUBLIC_ADSENSE_SLOT_HOME: process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME,
  });
}

/**
 * Contents of /ads.txt for a configured publisher ID, or null when ads are not
 * configured. "f08c47fec0942fa0" is Google's published certification
 * authority ID for AdSense ads.txt entries.
 */
export function buildAdsTxt(client: string | null): string | null {
  if (!isValidAdClient(client)) return null;
  const publisherId = client.trim().replace(/^ca-/, "");
  return `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`;
}
