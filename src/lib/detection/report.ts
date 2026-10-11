import { RISK_LABELS } from "./scoring";
import type { TextAnalysisResult, UrlToolResult } from "./types";

const TOOL_NAMES: Record<TextAnalysisResult["kind"], string> = {
  message: "Scam Message Checker",
  email: "Email Scam Checker",
  job: "Job Scam Checker",
  phone: "Phone Scam Message Checker",
};

const DISCLAIMER =
  "ScamSpotter uses local, pattern-based checks. It is not a trained AI model or a scam database, and a low result does not mean something is safe.";

/** Plain-text summary for the "Copy results" button. */
export function formatTextReport(result: TextAnalysisResult): string {
  const lines = [
    `ScamSpotter ${TOOL_NAMES[result.kind]} results`,
    `Warning-sign level: ${RISK_LABELS[result.riskLevel]} (score ${result.score})`,
    "",
  ];
  if (result.findings.length === 0) {
    lines.push("No common warning signs were found.");
  } else {
    lines.push(`Warning signs found (${result.findings.length}):`);
    for (const finding of result.findings) {
      lines.push(`- ${finding.title} [${finding.severity}]`);
      for (const evidence of finding.evidence) lines.push(`    "${evidence}"`);
    }
  }
  if (result.links.length > 0) {
    lines.push("", "Links found:");
    for (const link of result.links) {
      lines.push(`- ${link.input} (${RISK_LABELS[link.riskLevel]}${link.unresolved ? ", destination hidden" : ""})`);
    }
  }
  lines.push("", "Recommended next steps:");
  for (const step of result.recommendations) lines.push(`- ${step}`);
  lines.push("", DISCLAIMER);
  return lines.join("\n");
}

export function formatUrlReport(result: UrlToolResult): string {
  const { analysis } = result;
  const lines = [
    "ScamSpotter Website Safety Guide results",
    `Address: ${analysis.input}`,
    `Preliminary indicator level: ${RISK_LABELS[analysis.riskLevel]} (score ${analysis.score})${analysis.unresolved ? ", destination hidden" : ""}`,
    "",
    "Checks:",
  ];
  for (const check of analysis.checks) {
    lines.push(`- [${check.status.toUpperCase()}] ${check.label}: ${check.detail}`);
  }
  lines.push("", "Recommended next steps:");
  for (const step of result.recommendations) lines.push(`- ${step}`);
  lines.push(
    "",
    "These checks only look at how the address is written. ScamSpotter does not visit links, so this is not a reputation lookup and cannot tell you whether a site is safe.",
  );
  return lines.join("\n");
}
