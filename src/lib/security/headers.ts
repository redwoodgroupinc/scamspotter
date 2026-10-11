/**
 * HTTP security headers applied to every route (see next.config.ts).
 *
 * The Content-Security-Policy is strict by default. When a Google AdSense
 * publisher ID is configured, the policy is widened to the HTTPS origins the
 * Google ad stack needs (scripts, frames, images and beacons are served from
 * many Google-owned hosts, so those directives allow `https:`).
 */

export interface SecurityHeaderOptions {
  /** True when NEXT_PUBLIC_ADSENSE_CLIENT holds a valid publisher ID. */
  adsEnabled: boolean;
  /** True in `next dev`, which needs eval and a websocket for hot reload. */
  isDev: boolean;
  /** True on Vercel preview deployments, which should not be indexed. */
  isPreview: boolean;
}

export function buildContentSecurityPolicy({
  adsEnabled,
  isDev,
}: Pick<SecurityHeaderOptions, "adsEnabled" | "isDev">): string {
  // Next.js streams hydration data through small inline scripts, so
  // 'unsafe-inline' is required for scripts unless every page is rendered
  // dynamically with a per-request nonce. User input is never rendered as HTML.
  const scriptSrc = ["'self'", "'unsafe-inline'"];
  const connectSrc = ["'self'"];
  const imgSrc = ["'self'", "data:"];
  const frameSrc: string[] = [];

  if (isDev) {
    scriptSrc.push("'unsafe-eval'");
    connectSrc.push("ws:", "wss:");
  }

  if (adsEnabled) {
    scriptSrc.push("https:");
    connectSrc.push("https:");
    imgSrc.push("https:");
    frameSrc.push("https:");
  }

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": scriptSrc,
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": imgSrc,
    "font-src": ["'self'"],
    "connect-src": connectSrc,
    "frame-src": frameSrc.length > 0 ? frameSrc : ["'none'"],
    "frame-ancestors": ["'none'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "manifest-src": ["'self'"],
    "worker-src": ["'self'"],
  };

  const policy = Object.entries(directives).map(([name, values]) => `${name} ${values.join(" ")}`);
  if (!isDev) policy.push("upgrade-insecure-requests");
  return policy.join("; ");
}

export function buildSecurityHeaders(options: SecurityHeaderOptions): { key: string; value: string }[] {
  const headers = [
    { key: "Content-Security-Policy", value: buildContentSecurityPolicy(options) },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), bluetooth=()",
    },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  ];

  if (!options.isDev) {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=31536000; includeSubDomains",
    });
  }

  if (options.isPreview) {
    headers.push({ key: "X-Robots-Tag", value: "noindex, nofollow" });
  }

  return headers;
}
