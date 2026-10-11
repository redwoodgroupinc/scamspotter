/**
 * Shared types for ScamSpotter's local, rule-based detection engine.
 * Nothing in this module talks to a server: every check runs in the browser.
 */

export type CheckerKind = "message" | "email" | "job" | "phone";

export type RiskLevel = "low" | "medium" | "high";

/**
 * Severity labels map to fixed weights (see SEVERITY_WEIGHTS in scoring.ts):
 * weak = 1, moderate = 2, strong = 3, critical = 4.
 */
export type Severity = "weak" | "moderate" | "strong" | "critical";

export type FindingCategory =
  | "credentials"
  | "personal-data"
  | "payment"
  | "pressure"
  | "threat"
  | "lure"
  | "link"
  | "impersonation"
  | "software"
  | "secrecy"
  | "employment"
  | "sender"
  | "contact"
  | "obfuscation"
  | "combination";

export interface Finding {
  /** Stable rule identifier, e.g. "code-request". */
  id: string;
  title: string;
  category: FindingCategory;
  severity: Severity;
  weight: number;
  /**
   * Rules that detect overlapping versions of the same tactic share a group.
   * Only the highest weight in each group counts toward the score.
   */
  group: string;
  explanation: string;
  /** Short excerpts of the (normalised) input that triggered the rule. */
  evidence: string[];
}

export type CheckStatus = "pass" | "info" | "warn" | "fail";

export interface UrlCheck {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
  /** Contribution to the URL's preliminary score (0 for informational checks). */
  weight: number;
}

export interface UrlAnalysis {
  /** The address as entered or extracted (trimmed and length-limited). */
  input: string;
  /** Normalised href when the address could be parsed, otherwise null. */
  normalized: string | null;
  hostname: string | null;
  registrableDomain: string | null;
  scheme: string | null;
  schemeProvided: boolean;
  checks: UrlCheck[];
  score: number;
  riskLevel: RiskLevel;
  /** True when the real destination is hidden (for example, a link shortener). */
  unresolved: boolean;
}

export interface SenderObservation {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
}

export interface SenderAnalysis {
  input: string;
  displayName: string | null;
  address: string | null;
  domain: string | null;
  valid: boolean;
  observations: SenderObservation[];
}

export interface TextAnalysisResult {
  ok: true;
  kind: CheckerKind;
  riskLevel: RiskLevel;
  score: number;
  findings: Finding[];
  links: UrlAnalysis[];
  sender: SenderAnalysis | null;
  recommendations: string[];
  notices: string[];
  characterCount: number;
}

export interface UrlToolResult {
  ok: true;
  analysis: UrlAnalysis;
  recommendations: string[];
  notices: string[];
}

export type AnalysisErrorCode = "empty" | "too_long" | "invalid";

export interface AnalysisError {
  ok: false;
  error: AnalysisErrorCode;
  message: string;
  limit?: number;
}

export type TextAnalysisOutcome = TextAnalysisResult | AnalysisError;
export type UrlToolOutcome = UrlToolResult | AnalysisError;
