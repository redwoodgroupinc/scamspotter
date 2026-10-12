/**
 * Local, structural URL checks.
 *
 * IMPORTANT: nothing here fetches, resolves or visits a URL. Every check looks
 * only at the text of the address, so results are preliminary indicators and
 * never a verdict on whether a site is safe or malicious.
 */

import {
  AMBIGUOUS_KEYWORDS,
  BRANDS,
  EXECUTABLE_EXTENSIONS,
  FREE_HOSTING_SUFFIXES,
  GOVERNMENT_SUFFIXES,
  HIGH_ABUSE_TLDS,
  LURE_TOKENS,
  MESSAGING_LINK_HOSTS,
  MULTI_PART_SUFFIXES,
  RISKY_DOCUMENT_EXTENSIONS,
  URL_SHORTENERS,
  type BrandProfile,
} from "./domains";
import { MAX_LINKS_PER_TEXT, MAX_URL_LENGTH } from "./limits";
import { foldToLatin } from "./normalize";
import { hostnameToUnicode, labelToUnicode } from "./punycode";
import { riskLevelForScore } from "./scoring";
import type { UrlAnalysis, UrlCheck } from "./types";

const INVISIBLE = /[­​-‏‪-‮⁠-⁤⁦-⁩﻿]/g;
const WEB_SCHEME = /^(https?):\/\//i;
const DANGEROUS_SCHEME =
  /^(javascript|data|vbscript|file|blob|about|chrome|intent|ftp|ws|wss|mailto|tel|sms|smsto|market|itms-services):/i;
const OTHER_SCHEME = /^([a-z][a-z0-9+.-]*):\/\//i;
const IPV4 = /^(?:\d{1,3}\.){3}\d{1,3}$/;

/** Words that are one letter away from a brand but are ordinary words. */
const TYPO_EXCLUSIONS = new Set(["finance", "interact", "revolt", "balance", "goggles"]);

export type ParseResult =
  | { ok: true; url: URL; schemeProvided: boolean; cleaned: string; defanged: boolean }
  | {
      ok: false;
      reason: "empty" | "spaces" | "unsupported_scheme" | "invalid" | "incomplete";
      scheme?: string;
      cleaned: string;
    };

/** Turn "defanged" addresses from security reports (hxxp, [.]) back into normal form. */
function refang(value: string): { value: string; changed: boolean } {
  const refanged = value
    .replace(/^hxxp(s?):\/\//i, "http$1://")
    .replace(/\[\.\]|\(\.\)|\{\.\}/g, ".")
    .replace(/\[:\]/g, ":");
  return { value: refanged, changed: refanged !== value };
}

/** Remove trailing punctuation, keeping a ")" or "]" that closes one opened inside the address. */
function trimTrailingPunctuation(value: string): string {
  let result = value;
  for (;;) {
    const last = result.at(-1);
    if (last === undefined || !/[>)"'\].,;:!?]/.test(last)) return result;
    if (last === ")" || last === "]") {
      const open = last === ")" ? "(" : "[";
      if (result.split(open).length >= result.split(last).length) return result;
    }
    result = result.slice(0, -1);
  }
}

export function cleanUrlInput(raw: string): string {
  return trimTrailingPunctuation(
    raw
      .replace(INVISIBLE, "")
      .trim()
      .replace(/^[<("'\[]+/, ""),
  ).slice(0, MAX_URL_LENGTH);
}

export function parseUrlInput(raw: string): ParseResult {
  const { value: cleaned, changed: defanged } = refang(cleanUrlInput(raw));
  if (cleaned.length === 0) return { ok: false, reason: "empty", cleaned };
  if (/\s/.test(cleaned)) return { ok: false, reason: "spaces", cleaned };

  const dangerous = cleaned.match(DANGEROUS_SCHEME);
  if (dangerous) {
    return { ok: false, reason: "unsupported_scheme", scheme: dangerous[1]!.toLowerCase(), cleaned };
  }

  let candidate = cleaned;
  let schemeProvided = true;
  if (!WEB_SCHEME.test(cleaned)) {
    const other = cleaned.match(OTHER_SCHEME);
    if (other) {
      return { ok: false, reason: "unsupported_scheme", scheme: other[1]!.toLowerCase(), cleaned };
    }
    schemeProvided = false;
    candidate = `http://${cleaned.replace(/^\/+/, "")}`;
  }

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return { ok: false, reason: "invalid", cleaned };
  }

  const hostname = url.hostname.replace(/\.$/, "");
  if (!hostname) return { ok: false, reason: "invalid", cleaned };
  const isIp = IPV4.test(hostname) || hostname.startsWith("[");
  if (!isIp && hostname !== "localhost" && !hostname.includes(".")) {
    return { ok: false, reason: "incomplete", cleaned };
  }
  if (hostname.length > 253 || hostname.split(".").some((label) => label.length > 63 || label.length === 0)) {
    return { ok: false, reason: "invalid", cleaned };
  }
  return { ok: true, url, schemeProvided, cleaned, defanged };
}

/** The part of a hostname an individual registers, e.g. "example.co.uk". */
export function getRegistrableDomain(hostname: string): string {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  if (IPV4.test(host) || host.startsWith("[")) return host;
  const labels = host.split(".");
  if (labels.length <= 2) return host;
  // Check the longest known multi-part suffix first (e.g. "sites.google.com").
  for (let size = Math.min(3, labels.length - 1); size >= 2; size -= 1) {
    const suffix = labels.slice(-size).join(".");
    if (MULTI_PART_SUFFIXES.has(suffix)) return labels.slice(-(size + 1)).join(".");
  }
  return labels.slice(-2).join(".");
}

function hostMatches(hostname: string, domain: string): boolean {
  return hostname === domain || hostname.endsWith(`.${domain}`);
}

export function isOfficialFor(brand: BrandProfile, hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (brand.officialDomains.some((domain) => hostMatches(host, domain))) return true;
  return (brand.officialSuffixes ?? []).some((suffix) => hostMatches(host, suffix));
}

export function isOfficialForAnyBrand(hostname: string): boolean {
  return BRANDS.some((brand) => isOfficialFor(brand, hostname));
}

/** True for hostnames under a government suffix in the supported countries. */
export function isGovernmentHost(hostname: string): boolean {
  return GOVERNMENT_SUFFIXES.some((suffix) => hostMatches(hostname.toLowerCase(), suffix));
}

/** Split text into lowercase letter-only tokens ("pay-pal1.com" -> ["pay", "pal", "com"]). */
export function letterTokens(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter(Boolean);
}

export interface BrandReference {
  brand: BrandProfile;
  keyword: string;
}

/**
 * Find brand names mentioned in a piece of text such as a hostname, a sender
 * display name or a URL path. Ambiguous keywords (ordinary words or very short
 * abbreviations) only count when a "lure" word appears alongside them.
 */
export function findBrandReferences(value: string): BrandReference[] {
  const tokens = letterTokens(value);
  const joinedPairs = tokens.slice(0, -1).map((token, index) => token + tokens[index + 1]);
  const searchable = new Set([...tokens, ...joinedPairs]);
  const compact = tokens.join("");
  const hasLure = tokens.some((token) => LURE_TOKENS.has(token));
  const references: BrandReference[] = [];

  for (const brand of BRANDS) {
    let keyword = brand.keywords.find((candidate) => searchable.has(candidate));
    if (!keyword) {
      keyword = (brand.substringKeywords ?? []).find((candidate) => compact.includes(candidate));
    }
    if (!keyword) continue;
    if (AMBIGUOUS_KEYWORDS.has(keyword) && !hasLure) continue;
    references.push({ brand, keyword });
  }
  return references;
}

/** Optimal string alignment distance (Levenshtein plus adjacent transpositions). */
export function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > 2) return 3;
  const rows = a.length + 1;
  const cols = b.length + 1;
  const d: number[][] = Array.from({ length: rows }, () => new Array<number>(cols).fill(0));
  for (let i = 0; i < rows; i += 1) d[i]![0] = i;
  for (let j = 0; j < cols; j += 1) d[0]![j] = j;
  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let value = Math.min(d[i - 1]![j]! + 1, d[i]![j - 1]! + 1, d[i - 1]![j - 1]! + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        value = Math.min(value, d[i - 2]![j - 2]! + 1);
      }
      d[i]![j] = value;
    }
  }
  return d[a.length]![b.length]!;
}

/** Replace digits and letter pairs commonly used to imitate other letters. */
export function homoglyphVariants(value: string): string[] {
  const base = value
    .replace(/0/g, "o")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/7/g, "t")
    .replace(/8/g, "b")
    .replace(/rn/g, "m")
    .replace(/vv/g, "w");
  return Array.from(new Set([base.replace(/1/g, "l"), base.replace(/1/g, "i")]));
}

export interface LookalikeMatch {
  brand: BrandProfile;
  label: string;
  target: string;
  reason: "characters" | "spelling" | "hyphen";
}

/** Detect hostnames that imitate a brand's spelling, e.g. "paypa1", "arnazon", "pay-pal". */
export function findLookalike(hostname: string): LookalikeMatch | null {
  const host = hostname.toLowerCase();
  const registrable = getRegistrableDomain(host);
  const suffixLabels = registrable.split(".").length - 1;
  const labels = host.split(".").slice(0, -suffixLabels || undefined);

  for (const brand of BRANDS) {
    if (!brand.typoLabels || isOfficialFor(brand, host)) continue;
    for (const label of labels) {
      // International labels: compare what the reader sees ("аpple") with the brand.
      if (label.startsWith("xn--")) {
        const shown = labelToUnicode(label);
        const folded = foldToLatin(shown).toLowerCase();
        const target = brand.typoLabels.find(
          (name) => folded !== shown && (folded === name || folded.split("-").includes(name)),
        );
        if (target) return { brand, label: shown, target, reason: "characters" };
        continue;
      }
      const parts = label.split("-").filter(Boolean);
      const candidates = new Set([label, ...parts]);
      for (const target of brand.typoLabels) {
        if (label.includes("-") && label.replace(/-/g, "") === target) {
          return { brand, label, target, reason: "hyphen" };
        }
        for (const candidate of candidates) {
          if (candidate === target || candidate.length < 4) continue;
          if (homoglyphVariants(candidate).includes(target)) {
            return { brand, label: candidate, target, reason: "characters" };
          }
          if (
            target.length >= 6 &&
            candidate.length >= 6 &&
            !TYPO_EXCLUSIONS.has(candidate) &&
            /^[a-z]+$/.test(candidate) &&
            editDistance(candidate, target) === 1
          ) {
            return { brand, label: candidate, target, reason: "spelling" };
          }
        }
      }
    }
  }
  return null;
}

function isPrivateIpv4(host: string): boolean {
  const parts = host.split(".").map(Number);
  const [a, b] = parts as [number, number];
  return (
    a === 10 || a === 127 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 169 && b === 254)
  );
}

const PATH_LURE =
  /(?:^|[^a-z])(log-?in|sign-?in|verify|verification|validate|account|update|secure|password|wallet|billing|unlock|confirm|webscr|auth|recovery|reset)(?:[^a-z]|$)/i;
const REDIRECT_PARAM =
  /[?&](?:url|redirect|redirect_uri|redir|next|goto|target|dest|destination|continue|return|returnurl)=(?:https?|%68%74%74%70|http%3a)/i;

function pushCheck(checks: UrlCheck[], check: UrlCheck): void {
  checks.push(check);
}

/**
 * Analyse one address. Returns null when the input cannot be read as a web
 * address (the caller decides how to report that).
 */
export function analyzeUrl(raw: string): UrlAnalysis | null {
  const parsed = parseUrlInput(raw);
  if (!parsed.ok) return null;

  const { url, schemeProvided, cleaned } = parsed;
  const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
  const registrable = getRegistrableDomain(hostname);
  const scheme = url.protocol.replace(":", "");
  const checks: UrlCheck[] = [];
  const isIp = IPV4.test(hostname) || hostname.startsWith("[");

  // 1. Scheme
  if (!schemeProvided) {
    pushCheck(checks, {
      id: "scheme",
      label: "Connection type not shown",
      status: "info",
      weight: 0,
      detail:
        "No http:// or https:// was included, so we can't tell whether the connection is encrypted. Look for https:// in your browser's address bar. Remember that HTTPS only protects the connection; it doesn't prove the site is honest.",
    });
  } else if (scheme === "https") {
    pushCheck(checks, {
      id: "scheme",
      label: "Uses HTTPS",
      status: "pass",
      weight: 0,
      detail:
        "The connection would be encrypted. This does NOT mean the site is legitimate: scam sites routinely use HTTPS and show a padlock too.",
    });
  } else {
    pushCheck(checks, {
      id: "scheme",
      label: "Uses unencrypted HTTP",
      status: "warn",
      weight: 1,
      detail:
        "Information sent to this address would not be encrypted. Never enter passwords or payment details on a page that isn't using HTTPS.",
    });
  }

  // 2. Host type
  if (isIp) {
    const privateNote =
      !hostname.startsWith("[") && isPrivateIpv4(hostname)
        ? " This address points to a device on a private or local network."
        : "";
    pushCheck(checks, {
      id: "ip-address",
      label: "Uses a raw IP address instead of a name",
      status: "fail",
      weight: 3,
      detail: `Legitimate businesses almost always use a domain name. A numeric address like ${hostname} hides who runs the site.${privateNote}`,
    });
  }

  // 3. Userinfo trick (anything@realhost)
  if (url.username || url.password || /^[^/?#]*@/.test(cleaned.replace(/^[a-z]+:\/\//i, ""))) {
    pushCheck(checks, {
      id: "userinfo",
      label: "Contains an '@' before the real address",
      status: "fail",
      weight: 3,
      detail: `Browsers ignore everything before the '@'. Despite how it looks, this link actually goes to ${hostname}.`,
    });
  }

  // 4. Shortener
  const shortener = URL_SHORTENERS.has(registrable) || URL_SHORTENERS.has(hostname);
  if (shortener) {
    pushCheck(checks, {
      id: "shortener",
      label: "Shortened link: destination unknown",
      status: "warn",
      weight: 3,
      detail:
        "Link shorteners hide the real destination. ScamSpotter never opens links, so we can't see where this one leads. Treat it as unverified, and don't open it from an unexpected message.",
    });
  }

  // 5. Messaging links
  if (MESSAGING_LINK_HOSTS.has(hostname) || (hostname === "api.whatsapp.com" && url.pathname.startsWith("/send"))) {
    pushCheck(checks, {
      id: "messaging-link",
      label: "Opens a chat with an unknown account",
      status: "warn",
      weight: 1,
      detail:
        "This link opens WhatsApp, Telegram, Messenger or Signal rather than a website. Scammers often move conversations to private chat apps.",
    });
  }

  // 6. Brand and government lookalikes
  const lookalike = isIp ? null : findLookalike(hostname);
  const references = isIp ? [] : findBrandReferences(hostname.replace(/\.[^.]+$/, ""));
  // A domain that belongs to a known organisation isn't imitating another one.
  const misused = isOfficialForAnyBrand(hostname)
    ? []
    : references.filter((reference) => !isOfficialFor(reference.brand, hostname));
  const governmentToken =
    !isIp && letterTokens(hostname.replace(/\.[^.]+$/, "")).includes("gov") && !isGovernmentHost(hostname);

  if (lookalike) {
    const how =
      lookalike.reason === "characters"
        ? `uses look-alike characters ("${lookalike.label}" resembles "${lookalike.target}")`
        : lookalike.reason === "hyphen"
          ? `splits the name with a hyphen ("${lookalike.label}")`
          : `is one letter away from "${lookalike.target}" ("${lookalike.label}")`;
    pushCheck(checks, {
      id: "lookalike",
      label: `Looks like an imitation of ${lookalike.brand.name}`,
      status: "fail",
      weight: 4,
      detail: `The domain ${how}. Misspelled brand names are a common phishing trick. The real ${lookalike.brand.name} website is not at ${registrable}.`,
    });
  } else if (misused.length > 0) {
    const reference = misused[0]!;
    const official = reference.brand.officialDomains[0];
    const disguised = reference.brand.officialDomains.find(
      (domain) => hostname.startsWith(`${domain}.`) || hostname.includes(`.${domain}.`),
    );
    const isGov = reference.brand.kind === "government";
    const labelText = isGov
      ? `Mentions ${reference.brand.name} but isn't a government domain`
      : `Mentions ${reference.brand.name} but isn't one of its known domains`;
    const disguiseNote = disguised
      ? ` It starts with "${disguised}" to look official, but the domain that actually controls this address is ${registrable}.`
      : "";
    const officialNote = official
      ? ` ${reference.brand.name}'s main website is ${official}.`
      : isGov
        ? " Government websites in the US, UK, Canada and Australia use addresses ending in .gov, .gov.uk, .gc.ca / canada.ca or .gov.au."
        : "";
    pushCheck(checks, {
      id: "brand-mismatch",
      label: labelText,
      status: "fail",
      weight: 3,
      detail: `The address contains "${reference.keyword}", but the domain is ${registrable}.${disguiseNote}${officialNote} Our list of official domains is small, so check the company's real address yourself.`,
    });
  } else if (governmentToken) {
    pushCheck(checks, {
      id: "gov-mismatch",
      label: "Government-sounding name on a non-government domain",
      status: "fail",
      weight: 3,
      detail: `The address includes "gov", but ${registrable} is not a government domain. Government websites in the US, UK, Canada and Australia end in .gov, .gov.uk, .gc.ca / canada.ca or .gov.au.`,
    });
  } else if (!isIp) {
    const official = references.find((reference) => isOfficialFor(reference.brand, hostname));
    pushCheck(checks, {
      id: "lookalike",
      label: official ? `Matches a known ${official.brand.name} domain` : "No brand imitation detected",
      status: official ? "pass" : "info",
      weight: 0,
      detail: official
        ? `${registrable} is on ScamSpotter's short list of ${official.brand.name} domains. Scammers can still send links to real sites (for example, shared documents), so stay alert to what the page asks you to do.`
        : "We didn't find a misspelling of the banks, delivery companies, government services and tech brands on our list. The list is small, so compare the spelling with the organisation's real address yourself.",
    });
  }

  // 7. Internationalised / punycode domains
  if (hostname.split(".").some((label) => label.startsWith("xn--"))) {
    const shown = hostnameToUnicode(hostname);
    pushCheck(checks, {
      id: "punycode",
      label: "Uses international characters",
      status: "warn",
      weight: 2,
      detail: `This domain contains non-Latin or accented characters${shown !== hostname ? `: browsers may display it as "${shown}"` : ""}. These are legitimate for many languages, but they can also imitate familiar names with look-alike letters.`,
    });
  }

  if (!isIp) {
    const registrableLabels = registrable.split(".").length;
    const subdomainCount = hostname.split(".").length - registrableLabels;

    // 8. Deep subdomains
    if (subdomainCount >= 3) {
      pushCheck(checks, {
        id: "subdomains",
        label: "Unusually many subdomains",
        status: "warn",
        weight: 1,
        detail: `This address has ${subdomainCount} levels before the real domain (${registrable}). Long chains are sometimes used to push the real domain out of view on small screens.`,
      });
    }

    // 9. TLD
    const tld = hostname.split(".").pop() ?? "";
    if (HIGH_ABUSE_TLDS.has(tld)) {
      pushCheck(checks, {
        id: "tld",
        label: `Domain ending ".${tld}"`,
        status: "warn",
        weight: 1,
        detail: `.${tld} domains are inexpensive and appear frequently in security researchers' abuse reports. Plenty of honest sites use them too, so this is only a weak signal.`,
      });
    }

    // 10. Free hosting platforms
    const hosting = FREE_HOSTING_SUFFIXES.find((suffix) => hostMatches(hostname, suffix));
    if (hosting && !isOfficialForAnyBrand(hostname)) {
      pushCheck(checks, {
        id: "free-hosting",
        label: "Hosted on a free website platform",
        status: "warn",
        weight: 1,
        detail: `Anyone can publish a page on ${hosting}. Banks, government agencies and large companies rarely host login or payment pages there.`,
      });
    }

    // 11. Unusual domain pattern
    const mainLabel = registrable.split(".")[0] ?? "";
    const encoded = mainLabel.startsWith("xn--");
    const hyphens = encoded ? 0 : (mainLabel.match(/-/g) ?? []).length;
    const digits = encoded ? 0 : (mainLabel.match(/\d/g) ?? []).length;
    if (hyphens >= 3 || digits >= 5) {
      pushCheck(checks, {
        id: "domain-pattern",
        label: "Unusual domain name pattern",
        status: "warn",
        weight: 1,
        detail: `"${mainLabel}" contains ${hyphens >= 3 ? "several hyphens" : "a long run of digits"}. Scam domains often string words together, e.g. secure-account-verify-login.`,
      });
    }
  }

  // 12. Port
  if (url.port && url.port !== "80" && url.port !== "443") {
    pushCheck(checks, {
      id: "port",
      label: `Uses an unusual port (:${url.port})`,
      status: "warn",
      weight: 1,
      detail:
        "Public websites rarely need a port number in the address. This is more common on test servers and compromised machines.",
    });
  }

  // 13. Brand named only in the path, plus login-style wording
  const pathAndQuery = `${url.pathname}${url.search}`;
  let decodedPath = pathAndQuery;
  try {
    decodedPath = decodeURIComponent(pathAndQuery);
  } catch {
    // Malformed escape sequences: keep the raw path.
  }
  const official = isOfficialForAnyBrand(hostname);
  if (!official && !lookalike && misused.length === 0) {
    const pathBrand = findBrandReferences(decodedPath).find((reference) => !AMBIGUOUS_KEYWORDS.has(reference.keyword));
    if (pathBrand) {
      pushCheck(checks, {
        id: "path-brand",
        label: `Mentions ${pathBrand.brand.name} after the domain`,
        status: "warn",
        weight: 2,
        detail: `"${pathBrand.keyword}" appears in the page path, but the site itself is ${registrable}. Phishing pages often put a brand name after the domain so the link looks familiar.`,
      });
    }
  }
  if (!official && PATH_LURE.test(decodedPath)) {
    pushCheck(checks, {
      id: "path-keywords",
      label: "Login or verification wording in the address",
      status: "warn",
      weight: 1,
      detail:
        "The address contains words such as login, verify or account. That's normal on a site you already use, but be careful if you reached it from an unexpected message.",
    });
  }

  // 14. Embedded redirect
  if (REDIRECT_PARAM.test(url.search)) {
    pushCheck(checks, {
      id: "redirect",
      label: "Contains another web address inside it",
      status: "warn",
      weight: 1,
      detail:
        "Part of this link is another address. Links like this can forward you somewhere other than the site you see at the start.",
    });
  }

  // 15. Downloads
  const extension = url.pathname.toLowerCase().match(/\.([a-z0-9]{1,12})$/)?.[1];
  if (extension && EXECUTABLE_EXTENSIONS.has(extension)) {
    pushCheck(checks, {
      id: "download",
      label: `Downloads a program or app (.${extension})`,
      status: "fail",
      weight: 3,
      detail:
        "This link appears to download software. Apps sent through messages are a common way to install malware or remote-control tools. Only install apps from your device's official app store.",
    });
  } else if (extension && RISKY_DOCUMENT_EXTENSIONS.has(extension)) {
    pushCheck(checks, {
      id: "download",
      label: `Downloads a .${extension} file`,
      status: "warn",
      weight: 2,
      detail:
        "Archives, scripts, SVG images and macro-enabled documents are frequently used to deliver malware or fake login pages.",
    });
  }

  // 16. Length
  if (cleaned.length > 200) {
    pushCheck(checks, {
      id: "length",
      label: "Very long address",
      status: "info",
      weight: 0,
      detail:
        "Long addresses are common (tracking codes, for example) but make it easier to hide the real domain. Focus on the part just before the first single slash.",
    });
  }

  const weighted = checks.filter((check) => check.weight > 0);
  const score = weighted.reduce((total, check) => total + check.weight, 0);

  return {
    input: cleaned,
    normalized: url.href,
    hostname,
    registrableDomain: registrable,
    scheme: schemeProvided ? scheme : null,
    schemeProvided,
    checks,
    score,
    riskLevel: riskLevelForScore(score, weighted.length),
    unresolved: shortener,
  };
}

const COMMON_TLDS = [
  "com",
  "net",
  "org",
  "info",
  "biz",
  "co",
  "io",
  "me",
  "us",
  "uk",
  "ca",
  "au",
  "nz",
  "ie",
  "eu",
  "de",
  "fr",
  "es",
  "it",
  "nl",
  "in",
  "ru",
  "cn",
  "br",
  "mx",
  "gov",
  "edu",
  "app",
  "dev",
  "ai",
  "ly",
  "gl",
  "gd",
  "to",
  "cc",
  "ws",
  "tv",
  "sh",
  "la",
  "im",
  "gg",
  "at",
  "be",
  "ch",
  "se",
  "no",
  "dk",
  "fi",
  "pl",
  "pt",
  "gr",
  "tr",
  "za",
  "sg",
  "hk",
  "jp",
  "kr",
  "ph",
  "my",
  "id",
  "vn",
  "th",
  "pk",
  "ng",
  "ke",
  "link",
  "click",
  "top",
  "xyz",
  "shop",
  "online",
  "site",
  "club",
  "live",
  "store",
  "tech",
  "website",
  "space",
  "fun",
  "vip",
  "icu",
  "buzz",
  "cfd",
  "sbs",
  "bond",
  "rest",
  "monster",
  "cyou",
  "lol",
  "help",
  "support",
  "page",
  "pro",
  "mobi",
  "tk",
  "ml",
  "ga",
  "cf",
  "gq",
  "pw",
  "su",
  "win",
  "loan",
  "work",
  "life",
  "world",
  "today",
  "center",
  "digital",
  "email",
  "network",
  "services",
  "agency",
  "finance",
  "money",
  "cash",
  "credit",
  "delivery",
  "express",
  "quest",
  "cam",
  "fit",
  "kim",
  "date",
  "one",
  "new",
  "gs",
];

const URL_IN_TEXT = new RegExp(
  String.raw`\b(?:(?:https?|hxxps?):\/\/|www\.)[^\s<>"'\x60]+|\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.){1,10}(?:${COMMON_TLDS.join("|")})\b(?::\d{2,5})?(?:\/[^\s<>"'\x60]*)?`,
  "gi",
);
const SCHEME_URL_IN_TEXT = /\b(?:https?|hxxps?):\/\/[^\s<>"'\x60]+/gi;
// Repeats are capped (64-character mailbox names, 10 domain levels) so long
// runs of letters or dots can't make these patterns slow.
const EMAIL_IN_TEXT = /[\w.+-]{1,64}@[\w-]{1,63}(?:\.[\w-]{1,63}){1,10}/g;

/** Replace email addresses with spaces so their domains aren't mistaken for links. */
export function maskEmailAddresses(text: string): string {
  return text.replace(EMAIL_IN_TEXT, (match) => " ".repeat(match.length));
}

const blank = (match: string) => " ".repeat(match.length);

/**
 * Find web addresses in free text (de-duplicated, in order of appearance).
 * Addresses with a scheme are found first, so "https://bank.com@evil.com" is
 * read as a link rather than an email address; email addresses are then
 * masked so their domains aren't mistaken for bare links.
 */
export function extractUrls(text: string, limit = MAX_LINKS_PER_TEXT): string[] {
  const matches = [...text.matchAll(SCHEME_URL_IN_TEXT)];
  const rest = maskEmailAddresses(text.replace(SCHEME_URL_IN_TEXT, blank));
  matches.push(...rest.matchAll(URL_IN_TEXT));
  matches.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

  const found: string[] = [];
  const seen = new Set<string>();
  for (const match of matches) {
    const value = cleanUrlInput(match[0]);
    const key = value.toLowerCase();
    if (!value || seen.has(key)) continue;
    // Skip things like "e.g" or a bare word followed by a dot.
    if (!/[a-z]/i.test(value) || value.length < 4) continue;
    seen.add(key);
    found.push(value);
    if (found.length >= limit) break;
  }
  return found;
}

/** Replace web addresses with spaces (used before checking for file names in text). */
export function maskUrls(text: string): string {
  return maskEmailAddresses(text.replace(SCHEME_URL_IN_TEXT, blank)).replace(URL_IN_TEXT, blank);
}
