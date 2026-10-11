import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { AdSenseScript } from "@/components/ads/AdSenseScript";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getAdsConfig } from "@/lib/ads/config";
import { SITE } from "@/lib/site";
import "./globals.css";

const inter = localFont({
  src: "../fonts/InterVariable-latin.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});

const ads = getAdsConfig();

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name}: Free Scam Checker and Scam Prevention Guides`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  referrer: "strict-origin-when-cross-origin",
  formatDetection: { telephone: false, email: false, address: false },
  ...(SITE.googleSiteVerification ? { verification: { google: SITE.googleSiteVerification } } : {}),
  ...(ads.client ? { other: { "google-adsense-account": ads.client } } : {}),
};

export const viewport: Viewport = {
  themeColor: "#0f1d36",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main-content"
          className="sr-only z-50 rounded-md bg-brand-700 px-4 py-2 font-semibold text-white focus:not-sr-only focus:absolute focus:top-3 focus:left-3"
        >
          Skip to main content
        </a>
        <SiteHeader />
        <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
          {children}
        </main>
        <SiteFooter />
        <AdSenseScript />
      </body>
    </html>
  );
}
