import { AlertOctagon, AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import Link from "next/link";
import type { CheckStatus, Finding, RiskLevel, SenderAnalysis, UrlAnalysis } from "@/lib/detection";
import { RISK_THRESHOLDS } from "@/lib/detection";

const LEVEL_STYLES: Record<RiskLevel, { box: string; icon: string; badge: string }> = {
  high: { box: "border-red-300 bg-red-50", icon: "text-red-700", badge: "bg-red-700 text-white" },
  medium: { box: "border-amber-300 bg-amber-50", icon: "text-amber-700", badge: "bg-amber-600 text-navy-950" },
  low: { box: "border-navy-200 bg-navy-50", icon: "text-navy-700", badge: "bg-navy-700 text-white" },
};

export function levelHeadline(level: RiskLevel, findingCount: number, subject = "warning signs"): string {
  if (level === "high") return `High: several strong ${subject}`;
  if (level === "medium") return `Medium: some ${subject}`;
  return findingCount === 0 ? `Low: no common ${subject} found` : `Low: only weak or isolated ${subject}`;
}

function levelExplanation(level: RiskLevel, findingCount: number): string {
  if (level === "high") {
    return "This contains several features commonly found in scams. Don't act on it until you've confirmed it's genuine through an official channel.";
  }
  if (level === "medium") {
    return "This contains some features commonly found in scams. Verify it independently before you click, pay, reply or share anything.";
  }
  return findingCount === 0
    ? "We didn't find the patterns we check for. That does NOT mean it's safe: new scams may not match our rules, and genuine-looking messages can still be fake."
    : "We found only weak signals, which are common in legitimate messages too. A low result never means a message is safe.";
}

interface RiskSummaryProps {
  level: RiskLevel;
  score: number;
  findingCount: number;
  label?: string;
  extraBadge?: string;
}

export function RiskSummary({
  level,
  score,
  findingCount,
  label = "Warning-sign level",
  extraBadge,
}: RiskSummaryProps) {
  const styles = LEVEL_STYLES[level];
  const Icon = level === "high" ? AlertOctagon : level === "medium" ? AlertTriangle : Info;
  return (
    <div className={`rounded-2xl border-2 p-5 sm:p-6 ${styles.box}`}>
      <div className="flex items-start gap-3">
        <Icon className={`mt-1 h-7 w-7 shrink-0 ${styles.icon}`} aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold tracking-wide text-navy-700 uppercase">{label}</p>
          <p className="mt-1 text-2xl font-bold text-navy-950">{levelHeadline(level, findingCount)}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <span className={`rounded-full px-3 py-1 font-semibold ${styles.badge}`}>Score {score}</span>
            {extraBadge && (
              <span className="rounded-full bg-navy-800 px-3 py-1 font-semibold text-white">{extraBadge}</span>
            )}
            <span className="text-navy-700">
              Medium starts at {RISK_THRESHOLDS.medium}, High at {RISK_THRESHOLDS.high}.{" "}
              <Link href="/how-it-works#scoring" className="text-link">
                How scoring works
              </Link>
            </span>
          </div>
          <p className="mt-3 leading-relaxed text-navy-800">{levelExplanation(level, findingCount)}</p>
        </div>
      </div>
    </div>
  );
}

const SEVERITY_LABELS: Record<Finding["severity"], { text: string; className: string }> = {
  critical: { text: "Critical", className: "bg-red-700 text-white" },
  strong: { text: "Strong", className: "bg-amber-100 text-amber-900 ring-1 ring-amber-300" },
  moderate: { text: "Moderate", className: "bg-navy-100 text-navy-800" },
  weak: { text: "Weak", className: "bg-white text-navy-700 ring-1 ring-navy-200" },
};

export function FindingList({ findings }: { findings: Finding[] }) {
  if (findings.length === 0) return null;
  return (
    <section aria-labelledby="findings-heading" className="mt-8">
      <h3 id="findings-heading" className="text-xl font-bold text-navy-950">
        Warning signs found ({findings.length})
      </h3>
      <p className="mt-1 text-sm text-navy-700">
        Each sign adds its weight to the score. Related signs in the same group only count once.
      </p>
      <ul className="mt-4 space-y-4">
        {findings.map((finding) => {
          const severity = SEVERITY_LABELS[finding.severity];
          const isCombination = finding.category === "combination";
          return (
            <li key={finding.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h4 className="text-lg font-semibold text-navy-950">{finding.title}</h4>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${severity.className}`}
                >
                  {severity.text} &middot; +{finding.weight}
                </span>
              </div>
              <p className="mt-2 leading-relaxed text-navy-800">
                <span className="font-semibold">Why this can be suspicious: </span>
                {finding.explanation}
              </p>
              {finding.evidence.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-semibold text-navy-800">
                    {isCombination ? "Found together:" : "What triggered this:"}
                  </p>
                  <ul className="mt-1 space-y-1.5">
                    {finding.evidence.map((evidence) => (
                      <li
                        key={evidence}
                        className="rounded-lg border-l-4 border-navy-300 bg-navy-50 px-3 py-2 text-sm break-words text-navy-900"
                      >
                        {isCombination ? evidence : <q>{evidence}</q>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

const STATUS_ICONS: Record<CheckStatus, { Icon: typeof Info; className: string; label: string }> = {
  pass: { Icon: CheckCircle2, className: "text-navy-600", label: "No issue" },
  info: { Icon: Info, className: "text-brand-700", label: "Note" },
  warn: { Icon: AlertTriangle, className: "text-amber-700", label: "Caution" },
  fail: { Icon: XCircle, className: "text-red-700", label: "Warning" },
};

export function CheckList({ checks }: { checks: UrlAnalysis["checks"] | SenderAnalysis["observations"] }) {
  return (
    <ul className="mt-3 space-y-3">
      {checks.map((check) => {
        const status = STATUS_ICONS[check.status];
        return (
          <li key={check.id} className="flex gap-3">
            <status.Icon className={`mt-0.5 h-5 w-5 shrink-0 ${status.className}`} aria-hidden="true" />
            <div>
              <p className="font-semibold text-navy-950">
                <span className="sr-only">{status.label}: </span>
                {check.label}
              </p>
              <p className="text-sm leading-relaxed text-navy-700">{check.detail}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

const LINK_LEVEL_TEXT: Record<RiskLevel, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function LinkList({ links }: { links: UrlAnalysis[] }) {
  if (links.length === 0) return null;
  return (
    <section aria-labelledby="links-heading" className="mt-8">
      <h3 id="links-heading" className="text-xl font-bold text-navy-950">
        Links found ({links.length})
      </h3>
      <p className="mt-1 text-sm text-navy-700">
        ScamSpotter did not open these links. The checks below only look at how each address is written.
      </p>
      <ul className="mt-4 space-y-4">
        {links.map((link) => (
          <li key={link.input} className="card">
            <p className="font-mono text-sm break-all text-navy-950">{link.input}</p>
            <p className="mt-1 text-sm text-navy-700">
              Indicator level: <span className="font-semibold">{LINK_LEVEL_TEXT[link.riskLevel]}</span>
              {link.unresolved && <span className="font-semibold"> (destination hidden)</span>}
              {link.registrableDomain && (
                <>
                  {" "}
                  &middot; Domain: <span className="font-mono">{link.registrableDomain}</span>
                </>
              )}
            </p>
            <CheckList checks={link.checks.filter((check) => check.weight > 0 || check.status === "pass")} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SenderPanel({ sender }: { sender: SenderAnalysis | null }) {
  if (!sender) return null;
  return (
    <section aria-labelledby="sender-heading" className="mt-8">
      <h3 id="sender-heading" className="text-xl font-bold text-navy-950">
        Sender address
      </h3>
      <p className="mt-1 text-sm text-navy-700">
        We only checked how the address is written. We can&rsquo;t see email headers, so we can&rsquo;t tell whether it
        was forged or sent from a hacked account.
      </p>
      <div className="card mt-4">
        <p className="font-mono text-sm break-all text-navy-950">{sender.input}</p>
        <CheckList checks={sender.observations} />
      </div>
    </section>
  );
}

export function Recommendations({ items }: { items: string[] }) {
  return (
    <section aria-labelledby="next-steps-heading" className="mt-8">
      <h3 id="next-steps-heading" className="text-xl font-bold text-navy-950">
        Recommended next steps
      </h3>
      <ol className="mt-3 list-decimal space-y-2 pl-6 leading-relaxed text-navy-800 marker:font-semibold">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    </section>
  );
}

export function Notices({ notices }: { notices: string[] }) {
  if (notices.length === 0) return null;
  return (
    <ul className="mt-4 space-y-2">
      {notices.map((notice) => (
        <li
          key={notice}
          className="flex gap-2 rounded-lg border border-brand-200 bg-brand-50 p-3 text-sm text-navy-900"
        >
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" aria-hidden="true" />
          {notice}
        </li>
      ))}
    </ul>
  );
}

export function ResultLimitations() {
  return (
    <p className="mt-8 rounded-xl border border-navy-100 bg-white p-4 text-sm leading-relaxed text-navy-700">
      <span className="font-semibold text-navy-900">About this result: </span>
      ScamSpotter uses local, pattern-based checks that run in your browser. It is not a trained AI model and does not
      use a scam database, so it can miss new scams and can flag legitimate messages.{" "}
      <Link href="/how-it-works" className="text-link">
        See every rule we use
      </Link>
      .
    </p>
  );
}
