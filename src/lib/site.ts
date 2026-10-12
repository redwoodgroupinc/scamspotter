/**
 * Site-wide configuration. Public values only: nothing secret belongs here.
 */

const DEFAULT_SITE_URL = "https://scamspotter.net";

function resolveSiteUrl(value: string | undefined): string {
  if (!value) return DEFAULT_SITE_URL;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.hostname !== "localhost") return DEFAULT_SITE_URL;
    return url.origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

function resolveEmail(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed && /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[a-z]{2,}$/i.test(trimmed) ? trimmed : null;
}

export const SITE = {
  name: "ScamSpotter",
  domain: "ScamSpotter.net",
  tagline: "Spot the Scam. Stay Safe.",
  url: resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  description:
    "Free tools that check suspicious texts, emails, job offers, phone messages and web addresses for common scam warning signs, plus practical scam prevention guides for the US, UK, Canada and Australia.",
  contactEmail: resolveEmail(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
  googleSiteVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() || null,
  /** Date the site's standing pages (policies, tools, country pages) were last reviewed. */
  lastReviewed: "2026-10-12",
} as const;

export function absoluteUrl(path = "/"): string {
  return new URL(path, `${SITE.url}/`).toString();
}

export type ToolId = "message" | "email" | "job" | "website" | "phone";

export interface ToolInfo {
  id: ToolId;
  name: string;
  shortName: string;
  href: string;
  description: string;
}

export const TOOLS: ToolInfo[] = [
  {
    id: "message",
    name: "Scam Message Checker",
    shortName: "Message Checker",
    href: "/message-checker",
    description:
      "Check texts, WhatsApp and social media messages for pressure tactics, suspicious links and payment requests.",
  },
  {
    id: "email",
    name: "Email Scam Checker",
    shortName: "Email Checker",
    href: "/email-checker",
    description: "Look for phishing warning signs in an email's text and sender address.",
  },
  {
    id: "job",
    name: "Job Scam Checker",
    shortName: "Job Scam Checker",
    href: "/job-scam-checker",
    description: "Spot upfront fees, chat-only interviews, fake cheques and other job scam tactics.",
  },
  {
    id: "website",
    name: "Website Safety Guide",
    shortName: "Website Safety Guide",
    href: "/website-safety-guide",
    description:
      "Run preliminary checks on a web address, such as lookalike domains, raw IP addresses and shortened links.",
  },
  {
    id: "phone",
    name: "Phone Scam Message Checker",
    shortName: "Phone Scam Checker",
    href: "/phone-scam-checker",
    description: "Check a voicemail transcript or caller's message for impersonation, threats and code requests.",
  },
];

export interface NavLink {
  href: string;
  label: string;
}

export const PRIMARY_NAV: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/message-checker", label: "Message Checker" },
  { href: "/email-checker", label: "Email Checker" },
  { href: "/job-scam-checker", label: "Job Scam Checker" },
  { href: "/website-safety-guide", label: "Website Safety Guide" },
  { href: "/guides", label: "Scam Prevention Guides" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export const LEGAL_NAV: NavLink[] = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/editorial-policy", label: "Editorial Policy" },
  { href: "/how-it-works", label: "How ScamSpotter Works" },
];

export const COUNTRY_NAV: NavLink[] = [
  { href: "/scam-prevention/united-states", label: "USA Scam Prevention" },
  { href: "/scam-prevention/united-kingdom", label: "UK Scam Prevention" },
  { href: "/scam-prevention/canada", label: "Canada Scam Prevention" },
  { href: "/scam-prevention/australia", label: "Australia Scam Prevention" },
];
