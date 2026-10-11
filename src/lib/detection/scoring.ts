import type { Finding, RiskLevel, Severity } from "./types";

/**
 * Documented severity weights.
 *
 * - weak (1): common in scams but also very common in legitimate messages.
 * - moderate (2): a pressure tactic or claim worth checking.
 * - strong (3): a request or pattern frequently associated with fraud.
 * - critical (4): a request legitimate organisations almost never make this way.
 */
export const SEVERITY_WEIGHTS: Record<Severity, number> = {
  weak: 1,
  moderate: 2,
  strong: 3,
  critical: 4,
};

/**
 * Risk thresholds applied to the total score.
 *
 * - Low: score 0–2
 * - Medium: score 3–6
 * - High: score 7 or more, and warning signs from at least two groups
 *
 * Because the largest single weight is 4, no single rule can produce a High
 * result on its own.
 */
export const RISK_THRESHOLDS = {
  medium: 3,
  high: 7,
} as const;

export function riskLevelForScore(score: number, distinctGroups = 2): RiskLevel {
  if (!Number.isFinite(score) || score < RISK_THRESHOLDS.medium) return "low";
  if (score >= RISK_THRESHOLDS.high && distinctGroups >= 2) return "high";
  return "medium";
}

/**
 * Total score: for each group, only the highest-weighted finding counts.
 * This stops several near-duplicate rules (for example, two ways of asking for
 * a payment) from inflating the result.
 */
export function scoreFindings(findings: readonly Finding[]): { score: number; groups: number } {
  const bestByGroup = new Map<string, number>();
  for (const finding of findings) {
    const current = bestByGroup.get(finding.group) ?? 0;
    if (finding.weight > current) bestByGroup.set(finding.group, finding.weight);
  }
  let score = 0;
  for (const weight of bestByGroup.values()) score += weight;
  return { score, groups: bestByGroup.size };
}

export const RISK_LABELS: Record<RiskLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};
