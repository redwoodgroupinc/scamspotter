/**
 * ScamSpotter detection engine.
 *
 * Pure functions with no network access: the same input always produces the
 * same output. Results describe warning signs found in the text; they are not
 * a verdict about whether something is a scam.
 */

import {
  MAX_EVIDENCE_PER_FINDING,
  MAX_LINKS_PER_TEXT,
  MAX_SNIPPET_LENGTH,
  MAX_TEXT_LENGTH,
  MAX_URL_LENGTH,
} from "./limits";
import { looksNonEnglish, normalizeText, tidySnippet } from "./normalize";
import { buildRecommendations, buildUrlRecommendations } from "./recommendations";
import { LOW_EFFORT_CUES, TEXT_RULES, UNREALISTIC_PAY_THRESHOLDS, type TextRule } from "./rules";
import { analyzeSender } from "./sender-analysis";
import { riskLevelForScore, scoreFindings, SEVERITY_WEIGHTS } from "./scoring";
import type {
  AnalysisError,
  CheckerKind,
  Finding,
  FindingCategory,
  SenderAnalysis,
  Severity,
  TextAnalysisOutcome,
  UrlAnalysis,
  UrlToolOutcome,
} from "./types";
import { analyzeUrl, extractUrls, maskUrls, parseUrlInput } from "./url-analysis";

const NEGATION = /\b(?:never|not|don't|dont|do not|won't|will not|doesn't|does not|didn't|did not|cannot|can't|no one|nobody)\b/i;

/** True when the match is preceded, in the same clause, by a negation. */
export function isNegated(text: string, index: number): boolean {
  let before = text.slice(Math.max(0, index - 48), index);
  const breakAt = Math.max(
    before.lastIndexOf(","),
    before.lastIndexOf(";"),
    before.lastIndexOf(":"),
    before.lastIndexOf("."),
    before.lastIndexOf("!"),
    before.lastIndexOf("?"),
    before.lastIndexOf("\n"),
    before.lastIndexOf(" - "),
  );
  if (breakAt >= 0) before = before.slice(breakAt + 1);
  return NEGATION.test(before);
}

/** Build a readable excerpt around a match, snapped to word boundaries. */
export function makeSnippet(text: string, index: number, length: number): string {
  const context = 28;
  let start = Math.max(0, index - context);
  let end = Math.min(text.length, index + length + context);
  if (start > 0) {
    const space = text.indexOf(" ", start);
    if (space !== -1 && space < index) start = space + 1;
  }
  if (end < text.length) {
    const space = text.lastIndexOf(" ", end);
    if (space > index + length) end = space;
  }
  const core = tidySnippet(text.slice(start, end), MAX_SNIPPET_LENGTH);
  return `${start > 0 ? "…" : ""}${core}${end < text.length ? "…" : ""}`;
}

function collectEvidence(rule: TextRule, text: string, searchText: string): string[] {
  const evidence: string[] = [];
  for (const pattern of rule.patterns) {
    for (const match of searchText.matchAll(pattern)) {
      const index = match.index ?? 0;
      if (rule.negatable && isNegated(searchText, index)) continue;
      const snippet = makeSnippet(text, index, match[0].length);
      if (!evidence.includes(snippet)) evidence.push(snippet);
      if (evidence.length >= MAX_EVIDENCE_PER_FINDING) return evidence;
    }
  }
  return evidence;
}

function finding(
  id: string,
  title: string,
  category: FindingCategory,
  severity: Severity,
  group: string,
  explanation: string,
  evidence: string[],
): Finding {
  return { id, title, category, severity, weight: SEVERITY_WEIGHTS[severity], group, explanation, evidence };
}

const PAY_PATTERN =
  /(?:[$£€]|\b(?:usd|gbp|cad|aud|eur)\s?|\b[ca]\$)\s?(\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{1,2})?\s?(k\b)?(?:\s?(?:-|to)\s?(?:[$£€]|[ca]\$)?\s?(\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{1,2})?\s?(k\b)?)?\s?\+?\s?(?:per|a|an|\/|each|every)\s?(hour|hr|day|week|wk|month|mo)\b/gi;

function toAmount(digits: string | undefined, thousands: string | undefined): number {
  if (!digits) return 0;
  const value = Number(digits.replace(/,/g, ""));
  return thousands ? value * 1_000 : value;
}

/** Job ads promising unusually high pay together with low-effort cues. */
function detectUnrealisticPay(text: string): Finding | null {
  if (!LOW_EFFORT_CUES.test(text)) return null;
  const evidence: string[] = [];
  for (const match of text.matchAll(PAY_PATTERN)) {
    const amount = Math.max(toAmount(match[1], match[2]), toAmount(match[3], match[4]));
    const unit = (match[5] ?? "").toLowerCase();
    const period = unit.startsWith("h") ? "hour" : unit.startsWith("d") ? "day" : unit.startsWith("w") ? "week" : "month";
    if (amount >= UNREALISTIC_PAY_THRESHOLDS[period]) {
      evidence.push(makeSnippet(text, match.index ?? 0, match[0].length));
      if (evidence.length >= MAX_EVIDENCE_PER_FINDING) break;
    }
  }
  if (evidence.length === 0) return null;
  return finding(
    "job-unrealistic-pay",
    "Pay looks unrealistically high for the work described",
    "employment",
    "strong",
    "job-pay",
    `Pay far above normal rates for little effort or no experience is a classic lure for task scams, money-mule jobs and reshipping schemes. ScamSpotter flags pay of roughly ${UNREALISTIC_PAY_THRESHOLDS.hour}+ per hour, ${UNREALISTIC_PAY_THRESHOLDS.day}+ per day or ${UNREALISTIC_PAY_THRESHOLDS.week.toLocaleString("en-US")}+ per week when the ad also stresses no experience, part-time, remote or 'easy' work.`,
    evidence,
  );
}

const DECEPTIVE_URL_CHECKS = new Set(["lookalike", "brand-mismatch", "gov-mismatch", "userinfo", "ip-address", "punycode", "path-brand"]);
const WEAK_URL_CHECKS = new Set(["scheme", "tld", "subdomains", "free-hosting", "domain-pattern", "messaging-link", "redirect", "port", "path-keywords"]);

function linkFindings(links: UrlAnalysis[]): Finding[] {
  const deceptive: string[] = [];
  const shortened: string[] = [];
  const executables: string[] = [];
  const documents: string[] = [];
  const unusual: string[] = [];

  for (const link of links) {
    for (const check of link.checks) {
      if (check.weight === 0) continue;
      const line = `${link.input} (${check.label.toLowerCase()})`;
      if (DECEPTIVE_URL_CHECKS.has(check.id) && check.status !== "pass") deceptive.push(line);
      else if (check.id === "shortener") shortened.push(link.input);
      else if (check.id === "download" && check.status === "fail") executables.push(link.input);
      else if (check.id === "download") documents.push(link.input);
      else if (WEAK_URL_CHECKS.has(check.id)) unusual.push(line);
    }
  }

  const results: Finding[] = [];
  const top = (items: string[]) => Array.from(new Set(items)).slice(0, MAX_EVIDENCE_PER_FINDING);

  if (deceptive.length > 0) {
    results.push(
      finding(
        "link-deceptive",
        "Contains a link that imitates or hides the real website",
        "link",
        "strong",
        "links",
        "At least one link uses a trick often seen in phishing: a misspelled brand, a brand name on an unrelated domain, a raw IP address or characters that hide the real destination. Open the 'Links found' section for details.",
        top(deceptive),
      ),
    );
  }
  if (shortened.length > 0) {
    results.push(
      finding(
        "link-shortened",
        "Contains a shortened link",
        "link",
        "moderate",
        "links",
        "Shortened links hide where they lead. ScamSpotter doesn't open links, so the destination is unknown. Legitimate organisations do use them, but they're common in scam texts.",
        top(shortened),
      ),
    );
  }
  if (executables.length > 0) {
    results.push(
      finding(
        "link-download",
        "Contains a link that downloads an app or program",
        "software",
        "critical",
        "software",
        "Apps and programs sent through messages are a common way to install malware or remote-control tools. Only install software from your device's official app store.",
        top(executables),
      ),
    );
  } else if (documents.length > 0) {
    results.push(
      finding(
        "link-document",
        "Contains a link to an archive or web-page file",
        "software",
        "moderate",
        "software",
        "Links to .zip, .html and similar files are often used to deliver malware or fake login pages.",
        top(documents),
      ),
    );
  }
  if (unusual.length > 0) {
    results.push(
      finding(
        "link-unusual",
        "Contains a link with unusual features",
        "link",
        "weak",
        "links",
        "One or more links has a weaker warning sign, such as no encryption, a domain ending often seen in abuse reports, a free hosting platform or an embedded redirect. These features are common on legitimate sites too.",
        top(unusual),
      ),
    );
  }
  return results;
}

const SENDER_SEVERITY: Record<string, Severity> = {
  "sender-lookalike": "critical",
  "sender-display-address": "strong",
  "sender-free-provider-org": "strong",
  "sender-brand-mismatch": "strong",
};

function senderFindings(sender: SenderAnalysis): Finding[] {
  const results: Finding[] = [];
  const weak: string[] = [];
  for (const observation of sender.observations) {
    if (observation.status === "fail") {
      results.push(
        finding(
          observation.id,
          observation.label,
          "sender",
          SENDER_SEVERITY[observation.id] ?? "strong",
          "sender",
          observation.detail,
          [sender.input],
        ),
      );
    } else if (observation.status === "warn") {
      weak.push(observation.label);
    }
  }
  if (weak.length > 0) {
    results.push(
      finding(
        "sender-unusual",
        "Sender address has unusual features",
        "sender",
        "weak",
        "sender-weak",
        "The address has features that are uncommon for established organisations. On their own these are weak signals.",
        weak.slice(0, MAX_EVIDENCE_PER_FINDING),
      ),
    );
  }
  return results;
}

interface CombinationRule {
  id: string;
  title: string;
  severity: Severity;
  requires: readonly (readonly string[])[];
  explanation: string;
}

/**
 * Documented combinations of warning signs that are much more telling
 * together than apart. Each adds a small bonus on top of the individual rules.
 */
export const COMBINATION_RULES: readonly CombinationRule[] = [
  {
    id: "combo-new-contact-money",
    title: "Combination: new number plus a request for money",
    severity: "moderate",
    requires: [["new-contact"], ["money-request", "payment-method", "safe-account"]],
    explanation:
      "Someone claiming to be a friend or relative on a new number who then asks for money matches the widely reported 'Hi Mum' / family impersonation scam.",
  },
  {
    id: "combo-authority-payment",
    title: "Combination: an organisation asking for an unusual payment method",
    severity: "moderate",
    requires: [["impersonation", "threat", "id-number"], ["payment-method", "safe-account"]],
    explanation:
      "A bank, agency or company demanding gift cards, crypto or a transfer to a 'safe' account is one of the clearest scam patterns. Real organisations don't operate this way.",
  },
  {
    id: "combo-link-credentials",
    title: "Combination: a link plus a request to log in or verify",
    severity: "weak",
    requires: [["links"], ["credentials", "personal-data"]],
    explanation: "Phishing messages typically pair a link with a request to 'verify' or 'update' details.",
  },
  {
    id: "combo-job-money",
    title: "Combination: job offer plus a request for your money",
    severity: "moderate",
    requires: [["job-task", "job-pay", "job-process", "job-fee"], ["payment-method", "job-money"]],
    explanation:
      "An easy, high-paying job that also requires you to pay, deposit or move money matches the pattern of task scams and money-mule recruitment.",
  },
];

function combinationFindings(findings: readonly Finding[]): Finding[] {
  const groups = new Set(findings.map((item) => item.group));
  return COMBINATION_RULES.filter((rule) =>
    rule.requires.every((options) => options.some((group) => groups.has(group))),
  ).map((rule) => {
    const wanted = new Set(rule.requires.flat());
    const contributors = findings.filter((item) => wanted.has(item.group)).map((item) => item.title);
    return finding(
      rule.id,
      rule.title,
      "combination",
      rule.severity,
      rule.id,
      rule.explanation,
      Array.from(new Set(contributors)).slice(0, MAX_EVIDENCE_PER_FINDING),
    );
  });
}

function error(code: AnalysisError["error"], message: string, limit?: number): AnalysisError {
  return limit === undefined ? { ok: false, error: code, message } : { ok: false, error: code, message, limit };
}

export interface AnalyzeTextOptions {
  /** Optional sender address (Email Checker only). */
  sender?: string;
}

export function analyzeText(input: unknown, kind: CheckerKind, options: AnalyzeTextOptions = {}): TextAnalysisOutcome {
  if (typeof input !== "string") {
    return error("invalid", "Please paste some text to check.");
  }
  if (input.trim().length === 0) {
    return error("empty", "Please paste the message you want to check.");
  }
  if (input.length > MAX_TEXT_LENGTH) {
    return error(
      "too_long",
      `That's ${input.length.toLocaleString("en-US")} characters. The limit is ${MAX_TEXT_LENGTH.toLocaleString("en-US")}, so please check the most important part of the message.`,
      MAX_TEXT_LENGTH,
    );
  }

  const normalized = normalizeText(input);
  const text = normalized.text;
  const masked = maskUrls(text);
  const findings: Finding[] = [];

  for (const rule of TEXT_RULES) {
    if (!rule.appliesTo.includes(kind)) continue;
    const evidence = collectEvidence(rule, text, rule.includeAddresses ? text : masked);
    if (evidence.length > 0) {
      findings.push(finding(rule.id, rule.title, rule.category, rule.severity, rule.group, rule.explanation, evidence));
    }
  }

  if (kind === "job") {
    const pay = detectUnrealisticPay(text);
    if (pay) findings.push(pay);
  }

  const urls = extractUrls(text);
  const links = urls.map((url) => analyzeUrl(url)).filter((link): link is UrlAnalysis => link !== null);
  findings.push(...linkFindings(links));

  if (normalized.hadInvisibleCharacters || normalized.hadBidiControls || normalized.mixedScriptWords.length > 0) {
    const evidence =
      normalized.mixedScriptWords.length > 0
        ? normalized.mixedScriptWords.slice(0, MAX_EVIDENCE_PER_FINDING)
        : ["Invisible characters were found and removed before checking"];
    findings.push(
      finding(
        "hidden-characters",
        "Uses hidden or look-alike characters",
        "obfuscation",
        "moderate",
        "obfuscation",
        "The text contains invisible characters or words that mix letters from different alphabets (for example, a Cyrillic 'а' inside an English word). Scammers use these to slip past spam filters or to imitate brand names.",
        evidence,
      ),
    );
  }

  let sender: SenderAnalysis | null = null;
  if (kind === "email" && options.sender && options.sender.trim().length > 0) {
    sender = analyzeSender(options.sender, {
      bodyMentionsOrganisation: findings.some((item) => item.category === "impersonation"),
    });
    findings.push(...senderFindings(sender));
  }

  findings.push(...combinationFindings(findings));

  const order = new Map(TEXT_RULES.map((rule, index) => [rule.id, index]));
  findings.sort((a, b) => b.weight - a.weight || (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999));

  const { score, groups } = scoreFindings(findings);
  const riskLevel = riskLevelForScore(score, groups);

  const notices: string[] = [];
  if (looksNonEnglish(normalized)) {
    notices.push(
      "This text doesn't appear to be mainly in English. ScamSpotter's rules are written for English, so warning signs in other languages may be missed. Links and look-alike characters are still checked.",
    );
  }
  if (normalized.hadInvisibleCharacters) {
    notices.push("Invisible characters were removed before checking. Evidence snippets show the cleaned-up text.");
  }
  if (urls.length >= MAX_LINKS_PER_TEXT) {
    notices.push(`Only the first ${MAX_LINKS_PER_TEXT} links were checked.`);
  }
  if (sender && !sender.valid) {
    notices.push("The sender address couldn't be read, so only the message text was checked.");
  }

  return {
    ok: true,
    kind,
    riskLevel,
    score,
    findings,
    links,
    sender,
    recommendations: buildRecommendations(kind, riskLevel, findings),
    notices,
    characterCount: input.length,
  };
}

const EMAIL_ONLY = /^[^\s@/]+@[^\s@/]+\.[a-z]{2,}$/i;

export function analyzeUrlInput(input: unknown): UrlToolOutcome {
  if (typeof input !== "string" || input.trim().length === 0) {
    return error("empty", "Please enter a web address to check.");
  }
  if (input.length > MAX_URL_LENGTH) {
    return error(
      "too_long",
      `That address is ${input.length.toLocaleString("en-US")} characters long. The limit is ${MAX_URL_LENGTH.toLocaleString("en-US")}.`,
      MAX_URL_LENGTH,
    );
  }
  const trimmed = input.trim();
  if (EMAIL_ONLY.test(trimmed)) {
    return error("invalid", "That looks like an email address rather than a web address. To check a sender address, use the Email Checker.");
  }

  const parsed = parseUrlInput(trimmed);
  if (!parsed.ok) {
    switch (parsed.reason) {
      case "spaces":
        return error("invalid", "Web addresses can't contain spaces. Paste a single address, such as example.com/page.");
      case "unsupported_scheme":
        return error(
          "invalid",
          `"${parsed.scheme}:" isn't a normal website address. Links starting with ${parsed.scheme}: can run code, open apps or download files, so don't open it. This tool checks http:// and https:// addresses only.`,
        );
      case "incomplete":
        return error("invalid", "That address looks incomplete. Include the full domain, such as example.com or example.co.uk.");
      default:
        return error("invalid", "That doesn't look like a valid web address. Check it and try again, for example: https://www.example.com/page");
    }
  }

  const analysis = analyzeUrl(trimmed);
  if (!analysis) {
    return error("invalid", "That doesn't look like a valid web address. Check it and try again.");
  }

  const notices: string[] = [];
  if (parsed.defanged) {
    notices.push("This address was written in 'defanged' form (such as hxxp or [.]). We converted it back before checking.");
  }

  return {
    ok: true,
    analysis,
    recommendations: buildUrlRecommendations(
      analysis.unresolved,
      analysis.checks.some((check) => check.status === "warn" || check.status === "fail"),
    ),
    notices,
  };
}
