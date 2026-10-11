import Script from "next/script";
import { getAdsConfig } from "@/lib/ads/config";

/**
 * Loads the Google AdSense library once, site-wide, and only when a valid
 * publisher ID is configured. With no configuration, nothing is rendered.
 */
export function AdSenseScript() {
  const { enabled, client } = getAdsConfig();
  if (!enabled || !client) return null;

  return (
    <Script
      id="adsense-library"
      async
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`}
    />
  );
}
