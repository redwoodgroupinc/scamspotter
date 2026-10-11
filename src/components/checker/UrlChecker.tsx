"use client";

import { Copy, Eraser, RotateCcw, Search } from "lucide-react";
import { useId, useRef, useState, type FormEvent } from "react";
import {
  analyzeUrlInput,
  formatUrlReport,
  MAX_URL_LENGTH,
  RISK_LABELS,
  type UrlExample,
  type UrlToolResult,
} from "@/lib/detection";
import { CheckList, Notices, Recommendations, RiskSummary } from "./ResultParts";
import { prefersReducedMotion, useHydrated } from "./useHydrated";

interface UrlCheckerProps {
  examples: UrlExample[];
}

export function UrlChecker({ examples }: UrlCheckerProps) {
  const hydrated = useHydrated();
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState("");
  const [result, setResult] = useState<UrlToolResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  const inputId = `${id}-url`;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  function runAnalysis(input: string) {
    setCopyStatus("");
    const outcome = analyzeUrlInput(input);
    if (!outcome.ok) {
      setResult(null);
      setError(outcome.message);
      setAnnouncement("");
      inputRef.current?.focus();
      return;
    }
    setError(null);
    setResult(outcome);
    const warnings = outcome.analysis.checks.filter((check) => check.weight > 0).length;
    setAnnouncement(
      `Check complete. Preliminary indicator level: ${RISK_LABELS[outcome.analysis.riskLevel]}${
        outcome.analysis.unresolved ? ", destination hidden" : ""
      }. ${warnings} warning sign${warnings === 1 ? "" : "s"} found. Results follow the form.`,
    );
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
    });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runAnalysis(value);
  }

  function onClear() {
    setValue("");
    setResult(null);
    setError(null);
    setCopyStatus("");
    setAnnouncement("Cleared. You can enter another address.");
    inputRef.current?.focus();
  }

  async function onCopy() {
    if (!result) return;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(formatUrlReport(result));
      setCopyStatus("Results copied to your clipboard.");
    } catch {
      setCopyStatus("Couldn't copy automatically. Select the results text and copy it manually.");
    }
  }

  const analysis = result?.analysis;
  const warningCount = analysis?.checks.filter((check) => check.weight > 0).length ?? 0;

  return (
    <div>
      <form onSubmit={onSubmit} noValidate className="card">
        <label htmlFor={inputId} className="field-label">
          Web address to check
        </label>
        <p id={hintId} className="mb-3 text-sm text-navy-700">
          Paste a single address, such as https://www.example.com/page. Copy it carefully and don&rsquo;t open it
          first. We never visit the address you enter.
        </p>
        <input
          ref={inputRef}
          id={inputId}
          name="url"
          type="text"
          inputMode="url"
          className="field-input font-mono"
          placeholder="https://"
          value={value}
          maxLength={MAX_URL_LENGTH + 1}
          onChange={(event) => {
            setValue(event.target.value);
            if (error) setError(null);
          }}
          aria-describedby={`${hintId}${error ? ` ${errorId}` : ""}`}
          aria-invalid={error ? true : undefined}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
        />
        {error && (
          <p id={errorId} role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 font-medium text-red-800">
            {error}
          </p>
        )}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button type="submit" className="btn-primary sm:min-w-64" disabled={!hydrated}>
            <Search className="h-5 w-5" aria-hidden="true" />
            {hydrated ? "Check This Address" : "Loading checker…"}
          </button>
          <button type="button" className="btn-secondary" onClick={onClear} disabled={!hydrated}>
            <Eraser className="h-5 w-5" aria-hidden="true" />
            Clear
          </button>
        </div>
        <noscript>
          <p className="mt-4 rounded-lg bg-navy-50 p-3 text-sm text-navy-800">
            This checker needs JavaScript because the checks run in your browser.
          </p>
        </noscript>
      </form>

      {examples.length > 0 && (
        <div className="mt-6">
          <h2 className="text-base font-semibold text-navy-900">Try an example</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {examples.map((example) => (
              <li key={example.id}>
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-navy-200 bg-white px-4 py-2 text-left text-sm font-medium text-navy-800 hover:border-brand-500 hover:bg-brand-50 disabled:opacity-60"
                  onClick={() => {
                    setValue(example.url);
                    runAnalysis(example.url);
                  }}
                  disabled={!hydrated}
                >
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      example.kind === "suspicious" ? "bg-red-50 text-red-800" : "bg-navy-100 text-navy-800"
                    }`}
                  >
                    {example.kind === "suspicious" ? "Suspicious" : "Legitimate"}
                  </span>
                  {example.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <div ref={resultsRef} className="scroll-mt-6">
        {result && analysis && (
          <section aria-labelledby={`${id}-results`} className="mt-10" data-testid="checker-results">
            <h2 id={`${id}-results`} className="mb-4 text-2xl font-bold text-navy-950">
              Preliminary checks
            </h2>
            <RiskSummary
              level={analysis.riskLevel}
              score={analysis.score}
              findingCount={warningCount}
              label="Preliminary indicator level"
              extraBadge={analysis.unresolved ? "Destination hidden" : undefined}
            />
            <Notices notices={result.notices} />
            <div className="card mt-6">
              <p className="text-sm font-semibold text-navy-700">Address checked</p>
              <p className="mt-1 font-mono text-sm break-all text-navy-950">{analysis.input}</p>
              {analysis.registrableDomain && (
                <p className="mt-2 text-sm text-navy-800">
                  The domain that controls this address is{" "}
                  <span className="font-mono font-semibold">{analysis.registrableDomain}</span>. This is the part to
                  compare with the organisation&rsquo;s real website.
                </p>
              )}
            </div>
            <section aria-labelledby={`${id}-checks`} className="mt-8">
              <h3 id={`${id}-checks`} className="text-xl font-bold text-navy-950">
                What we checked
              </h3>
              <CheckList checks={analysis.checks} />
            </section>
            <Recommendations items={result.recommendations} />
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button type="button" className="btn-secondary" onClick={onCopy}>
                <Copy className="h-5 w-5" aria-hidden="true" />
                Copy results
              </button>
              <button type="button" className="btn-secondary" onClick={onClear}>
                <RotateCcw className="h-5 w-5" aria-hidden="true" />
                Check another address
              </button>
            </div>
            <p role="status" aria-live="polite" className="mt-2 min-h-6 text-sm font-medium text-navy-800">
              {copyStatus}
            </p>
            <p className="mt-6 rounded-xl border border-navy-100 bg-white p-4 text-sm leading-relaxed text-navy-700">
              <span className="font-semibold text-navy-900">About this result: </span>
              These are preliminary indicators based only on how the address is written. ScamSpotter does not visit
              links, follow redirects or check a reputation database, so it cannot tell you whether a site is safe,
              malware-free or fraudulent.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
