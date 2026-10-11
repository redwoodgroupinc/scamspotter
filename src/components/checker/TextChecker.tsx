"use client";

import { Copy, Eraser, Lock, RotateCcw, Search } from "lucide-react";
import { useId, useRef, useState, type FormEvent } from "react";
import {
  analyzeText,
  formatTextReport,
  MAX_SENDER_LENGTH,
  MAX_TEXT_LENGTH,
  RISK_LABELS,
  type CheckerKind,
  type TextAnalysisResult,
  type TextExample,
} from "@/lib/detection";
import {
  FindingList,
  LinkList,
  Notices,
  Recommendations,
  ResultLimitations,
  RiskSummary,
  SenderPanel,
} from "./ResultParts";
import { prefersReducedMotion, useHydrated } from "./useHydrated";

export function PrivacyReminder({ id }: { id: string }) {
  return (
    <div
      id={id}
      className="mb-5 flex gap-3 rounded-xl border border-navy-200 bg-navy-50 p-4 text-sm leading-relaxed text-navy-900"
    >
      <Lock className="mt-0.5 h-5 w-5 shrink-0 text-navy-700" aria-hidden="true" />
      <p>
        <span className="font-semibold">Before you paste: </span>
        remove passwords, verification codes, bank or card details, ID numbers and other personal information. The check
        runs in your browser and your text isn&rsquo;t sent to or stored by ScamSpotter.
      </p>
    </div>
  );
}

interface TextCheckerProps {
  kind: CheckerKind;
  inputLabel: string;
  inputHint: string;
  placeholder: string;
  examples: TextExample[];
  submitLabel?: string;
  showSender?: boolean;
}

const COUNTRY_LABELS: Record<TextExample["country"], string> = {
  US: "US",
  UK: "UK",
  CA: "Canada",
  AU: "Australia",
  Any: "Any country",
};

export function TextChecker({
  kind,
  inputLabel,
  inputHint,
  placeholder,
  examples,
  submitLabel = "Check for Warning Signs",
  showSender = false,
}: TextCheckerProps) {
  const hydrated = useHydrated();
  const id = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState("");
  const [sender, setSender] = useState("");
  const [result, setResult] = useState<TextAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  const textId = `${id}-text`;
  const hintId = `${id}-hint`;
  const countId = `${id}-count`;
  const errorId = `${id}-error`;
  const senderId = `${id}-sender`;
  const tooLong = text.length > MAX_TEXT_LENGTH;

  function runAnalysis(value: string, senderValue: string) {
    setCopyStatus("");
    const outcome = analyzeText(value, kind, { sender: showSender ? senderValue : undefined });
    if (!outcome.ok) {
      setResult(null);
      setError(outcome.message);
      setAnnouncement("");
      textareaRef.current?.focus();
      return;
    }
    setError(null);
    setResult(outcome);
    const count = outcome.findings.length;
    setAnnouncement(
      `Check complete. Warning-sign level: ${RISK_LABELS[outcome.riskLevel]}. ${count} warning sign${count === 1 ? "" : "s"} found. Results follow the form.`,
    );
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView?.({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
    });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runAnalysis(text, sender);
  }

  function onClear() {
    setText("");
    setSender("");
    setResult(null);
    setError(null);
    setCopyStatus("");
    setAnnouncement("Cleared. You can paste another message.");
    textareaRef.current?.focus();
  }

  function onExample(example: TextExample) {
    setText(example.text);
    setSender(example.sender ?? "");
    runAnalysis(example.text, example.sender ?? "");
  }

  async function onCopy() {
    if (!result) return;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(formatTextReport(result));
      setCopyStatus("Results copied to your clipboard.");
    } catch {
      setCopyStatus("Couldn't copy automatically. Select the results text and copy it manually.");
    }
  }

  return (
    <div>
      <form onSubmit={onSubmit} noValidate className="card">
        <PrivacyReminder id={`${id}-privacy`} />
        <label htmlFor={textId} className="field-label">
          {inputLabel}
        </label>
        <p id={hintId} className="mb-3 text-sm text-navy-700">
          {inputHint}
        </p>
        <textarea
          ref={textareaRef}
          id={textId}
          name="text"
          rows={8}
          className="field-input min-h-48 resize-y leading-relaxed"
          placeholder={placeholder}
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            if (error) setError(null);
          }}
          aria-describedby={`${id}-privacy ${hintId} ${countId}${error ? ` ${errorId}` : ""}`}
          aria-invalid={error || tooLong ? true : undefined}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          data-gramm="false"
        />
        <p id={countId} className={`mt-2 text-sm ${tooLong ? "font-semibold text-red-700" : "text-navy-600"}`}>
          {text.length.toLocaleString("en-US")} / {MAX_TEXT_LENGTH.toLocaleString("en-US")} characters
          {tooLong && " (too long)"}
        </p>

        {showSender && (
          <div className="mt-5">
            <label htmlFor={senderId} className="field-label">
              Sender address <span className="font-normal text-navy-600">(optional)</span>
            </label>
            <p id={`${senderId}-hint`} className="mb-2 text-sm text-navy-700">
              For example: name@example.com or Name &lt;name@example.com&gt;
            </p>
            <input
              id={senderId}
              name="sender"
              type="text"
              inputMode="email"
              className="field-input"
              value={sender}
              maxLength={MAX_SENDER_LENGTH}
              onChange={(event) => setSender(event.target.value)}
              aria-describedby={`${senderId}-hint`}
              autoComplete="off"
              spellCheck={false}
              autoCapitalize="none"
            />
          </div>
        )}

        {error && (
          <p
            id={errorId}
            role="alert"
            className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 font-medium text-red-800"
          >
            {error}
          </p>
        )}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button type="submit" className="btn-primary sm:min-w-64" disabled={!hydrated}>
            <Search className="h-5 w-5" aria-hidden="true" />
            {hydrated ? submitLabel : "Loading checker…"}
          </button>
          <button type="button" className="btn-secondary" onClick={onClear} disabled={!hydrated}>
            <Eraser className="h-5 w-5" aria-hidden="true" />
            Clear
          </button>
        </div>
        <noscript>
          <p className="mt-4 rounded-lg bg-navy-50 p-3 text-sm text-navy-800">
            This checker needs JavaScript because the analysis runs in your browser. Your text is never sent to our
            servers.
          </p>
        </noscript>
      </form>

      {examples.length > 0 && (
        <div className="mt-6">
          <h2 className="text-base font-semibold text-navy-900">Try an example</h2>
          <p className="mt-1 text-sm text-navy-700">
            Examples are written by ScamSpotter to illustrate common patterns. Links in them use reserved
            &ldquo;.example&rdquo; addresses that don&rsquo;t lead anywhere.
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {examples.map((example) => (
              <li key={example.id}>
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-navy-200 bg-white px-4 py-2 text-left text-sm font-medium text-navy-800 hover:border-brand-500 hover:bg-brand-50 disabled:opacity-60"
                  onClick={() => onExample(example)}
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
                  <span className="text-xs text-navy-600">({COUNTRY_LABELS[example.country]})</span>
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
        {result && (
          <section aria-labelledby={`${id}-results`} className="mt-10" data-testid="checker-results">
            <h2 id={`${id}-results`} className="mb-4 text-2xl font-bold text-navy-950">
              Your results
            </h2>
            <RiskSummary level={result.riskLevel} score={result.score} findingCount={result.findings.length} />
            <Notices notices={result.notices} />
            <FindingList findings={result.findings} />
            <SenderPanel sender={result.sender} />
            <LinkList links={result.links} />
            <Recommendations items={result.recommendations} />
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button type="button" className="btn-secondary" onClick={onCopy}>
                <Copy className="h-5 w-5" aria-hidden="true" />
                Copy results
              </button>
              <button type="button" className="btn-secondary" onClick={onClear}>
                <RotateCcw className="h-5 w-5" aria-hidden="true" />
                Check another message
              </button>
            </div>
            <p role="status" aria-live="polite" className="mt-2 min-h-6 text-sm font-medium text-navy-800">
              {copyStatus}
            </p>
            <ResultLimitations />
          </section>
        )}
      </div>
    </div>
  );
}
