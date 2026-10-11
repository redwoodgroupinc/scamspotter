import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Callout } from "@/components/ui/Callout";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  COMBINATION_RULES,
  RISK_THRESHOLDS,
  SEVERITY_WEIGHTS,
  TEXT_RULES,
  UNREALISTIC_PAY_THRESHOLDS,
  type CheckerKind,
  type Severity,
} from "@/lib/detection";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "How ScamSpotter Works: Rules, Scoring and Limits",
  description:
    "Every rule, weight and threshold ScamSpotter uses to highlight scam warning signs, how the analysis stays private in your browser, and the limits of pattern-based checks.",
  path: "/how-it-works",
});

const SEVERITY_TEXT: Record<Severity, string> = {
  critical: "Critical",
  strong: "Strong",
  moderate: "Moderate",
  weak: "Weak",
};
const KIND_TEXT: Record<CheckerKind, string> = { message: "Message", email: "Email", job: "Job", phone: "Phone" };

const URL_CHECKS: [string, string, string][] = [
  ["Look-alike brand spelling (e.g. paypa1, arnazon, pay-pal)", "Fail", "+4"],
  ["Brand or government name on an unrelated domain", "Fail", "+3"],
  ["Raw IP address instead of a domain name", "Fail", "+3"],
  ["'@' trick that hides the real destination", "Fail", "+3"],
  ["Link downloads a program or app (.apk, .exe and similar)", "Fail", "+3"],
  ["Known link shortener (destination hidden)", "Caution", "+3"],
  ["International characters (punycode)", "Caution", "+2"],
  ["Brand name only in the page path", "Caution", "+2"],
  ["Link downloads an archive, web page or macro file", "Caution", "+2"],
  ["Unencrypted HTTP", "Caution", "+1"],
  ["Domain ending common in abuse reports", "Caution", "+1"],
  ["Three or more subdomain levels", "Caution", "+1"],
  ["Free website-hosting platform", "Caution", "+1"],
  ["Many hyphens or digits in the domain", "Caution", "+1"],
  ["Unusual port number", "Caution", "+1"],
  ["Login or verification wording on an unlisted domain", "Caution", "+1"],
  ["Another address embedded as a redirect", "Caution", "+1"],
  ["Opens a chat app (WhatsApp, Telegram and similar)", "Caution", "+1"],
];

export default function HowItWorksPage() {
  return (
    <Container className="py-8 sm:py-10">
      <Breadcrumbs items={[{ name: "How ScamSpotter Works", href: "/how-it-works" }]} />
      <div className="max-w-4xl">
        <PageHeader title="How ScamSpotter Works">
          <p>
            ScamSpotter&rsquo;s checkers are deliberately simple and transparent. This page lists every rule, weight and
            threshold they use, so you can see exactly why a message received its result.
          </p>
        </PageHeader>

        <Callout tone="info" title="Local pattern-based analysis">
          The checkers use hand-written rules that run in your browser. They do not use a trained AI model, a
          comprehensive scam database or any online lookups, and they can&rsquo;t confirm whether a message is genuine.
        </Callout>

        <div className="mt-10 space-y-12 text-lg leading-relaxed text-navy-800">
          <section aria-labelledby="steps-heading">
            <h2 id="steps-heading" className="text-2xl font-bold text-navy-950">
              What happens when you click &ldquo;Check&rdquo;
            </h2>
            <ol className="mt-4 list-decimal space-y-3 pl-6">
              <li>
                <strong>Validation.</strong> Empty text is rejected, and messages are limited to 10,000 characters (web
                addresses to 2,048) to keep checks fast.
              </li>
              <li>
                <strong>Clean-up.</strong> We remove invisible characters, convert stylised Unicode letters (such as
                bold maths letters) to ordinary ones, and note any words that mix alphabets, a trick used to imitate
                brand names. Your original text is never executed or displayed as HTML.
              </li>
              <li>
                <strong>Rules.</strong> Each rule is a small set of patterns describing a scam tactic. Some patterns
                ignore phrases such as &ldquo;never share your code&rdquo; so that genuine security warnings
                aren&rsquo;t flagged.
              </li>
              <li>
                <strong>Links.</strong> Web addresses in the text are extracted and checked structurally, without being
                opened.
              </li>
              <li>
                <strong>Scoring.</strong> Matching rules add their weight to a score, which sets the warning-sign level.
              </li>
              <li>
                <strong>Explanation.</strong> You see each warning sign, the text that triggered it, why it matters and
                what to do next.
              </li>
            </ol>
          </section>

          <section aria-labelledby="scoring-heading" id="scoring">
            <h2 id="scoring-heading" className="text-2xl font-bold text-navy-950">
              Scoring and thresholds
            </h2>
            <p className="mt-4">Every rule has one of four severities, each with a fixed weight:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                <strong>Weak (+{SEVERITY_WEIGHTS.weak}):</strong> common in scams but also very common in genuine
                messages, such as a generic greeting.
              </li>
              <li>
                <strong>Moderate (+{SEVERITY_WEIGHTS.moderate}):</strong> a pressure tactic or claim worth checking,
                such as a deadline or a mention of a bank.
              </li>
              <li>
                <strong>Strong (+{SEVERITY_WEIGHTS.strong}):</strong> a request or pattern frequently associated with
                fraud, such as a link that imitates a brand.
              </li>
              <li>
                <strong>Critical (+{SEVERITY_WEIGHTS.critical}):</strong> a request legitimate organisations almost
                never make this way, such as asking you to read out a one-time code or pay with gift cards.
              </li>
            </ul>
            <p className="mt-4">
              Rules that describe the same tactic share a group, and only the strongest match in each group counts. The
              total score sets the level:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                <strong>Low:</strong> 0 to {RISK_THRESHOLDS.medium - 1}. Few or no warning signs. This never means
                &ldquo;safe&rdquo;.
              </li>
              <li>
                <strong>Medium:</strong> {RISK_THRESHOLDS.medium} to {RISK_THRESHOLDS.high - 1}. Some warning signs;
                verify before acting.
              </li>
              <li>
                <strong>High:</strong> {RISK_THRESHOLDS.high} or more, from at least two different groups. Several
                strong warning signs together.
              </li>
            </ul>
            <p className="mt-4">
              Because the largest single weight is {SEVERITY_WEIGHTS.critical}, no single keyword or rule can produce a
              High result on its own.
            </p>
          </section>

          <section aria-labelledby="combo-heading">
            <h2 id="combo-heading" className="text-2xl font-bold text-navy-950">
              Combinations
            </h2>
            <p className="mt-4">
              A few combinations are much more telling together than apart, so they add a small, documented bonus:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              {COMBINATION_RULES.map((rule) => (
                <li key={rule.id}>
                  <strong>
                    {rule.title.replace("Combination: ", "")} (+{SEVERITY_WEIGHTS[rule.severity]}).
                  </strong>{" "}
                  {rule.explanation}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="rules-heading">
            <h2 id="rules-heading" className="text-2xl font-bold text-navy-950">
              Every text rule
            </h2>
            <p className="mt-4">
              The Job Scam Checker also flags pay that looks unrealistic when an advert stresses no experience, remote
              or &ldquo;easy&rdquo; work: roughly {UNREALISTIC_PAY_THRESHOLDS.hour}+ per hour,{" "}
              {UNREALISTIC_PAY_THRESHOLDS.day}+ per day, {UNREALISTIC_PAY_THRESHOLDS.week.toLocaleString("en-US")}+ per
              week or {UNREALISTIC_PAY_THRESHOLDS.month.toLocaleString("en-US")}+ per month (strong, +3).
            </p>
            <div className="mt-4 overflow-x-auto rounded-2xl border border-navy-100">
              <table className="w-full min-w-[40rem] text-left text-base">
                <caption className="sr-only">
                  All text rules with severity, weight and the checkers that use them
                </caption>
                <thead className="bg-navy-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Warning sign
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Severity
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Used by
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {TEXT_RULES.map((rule) => (
                    <tr key={rule.id} className="border-t border-navy-100 align-top">
                      <td className="px-4 py-3">
                        <span className="font-medium text-navy-950">{rule.title}</span>
                        <span className="mt-1 block text-sm text-navy-700">{rule.explanation}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {SEVERITY_TEXT[rule.severity]} (+{SEVERITY_WEIGHTS[rule.severity]})
                      </td>
                      <td className="px-4 py-3 text-sm">{rule.appliesTo.map((kind) => KIND_TEXT[kind]).join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section aria-labelledby="url-heading">
            <h2 id="url-heading" className="text-2xl font-bold text-navy-950">
              Web address checks
            </h2>
            <p className="mt-4">
              The{" "}
              <Link href="/website-safety-guide" className="text-link">
                Website Safety Guide
              </Link>{" "}
              and the link checks inside the other tools look only at how an address is written. We never request, open
              or follow it. HTTPS is reported, but it never lowers the score, because scam sites use HTTPS too.
            </p>
            <div className="mt-4 overflow-x-auto rounded-2xl border border-navy-100">
              <table className="w-full min-w-[32rem] text-left text-base">
                <caption className="sr-only">Web address checks and their weights</caption>
                <thead className="bg-navy-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Check
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Result
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Weight
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {URL_CHECKS.map(([check, result, weight]) => (
                    <tr key={check} className="border-t border-navy-100">
                      <td className="px-4 py-3">{check}</td>
                      <td className="px-4 py-3">{result}</td>
                      <td className="px-4 py-3">{weight}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4">
              Inside messages, links are summarised as a single &ldquo;links&rdquo; group: a deceptive link counts as
              strong (+3), a shortened link as moderate (+2) and other link features as weak (+1). A link that downloads
              an app or program counts as a critical software warning (+4). Brand checks use a short, hand-maintained
              list of banks, delivery companies, government services and technology brands, plus a simplified list of
              domain endings, so they will miss many imitations.
            </p>
          </section>

          <section aria-labelledby="sender-heading">
            <h2 id="sender-heading" className="text-2xl font-bold text-navy-950">
              Email sender checks
            </h2>
            <p className="mt-4">
              If you add a sender address in the Email Checker, we look for a domain that imitates a brand (critical,
              +4), a display name that shows a different address, an organisation writing from a free personal mailbox,
              or a brand or government name on an unrelated domain (each strong, +3). Unusual domain endings,
              random-looking mailbox names and hyphen-heavy domains are weak signals (+1). We can&rsquo;t see email
              headers, so we can&rsquo;t detect forged or hacked senders.
            </p>
          </section>

          <section aria-labelledby="limits-heading">
            <h2 id="limits-heading" className="text-2xl font-bold text-navy-950">
              Known limitations
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>Rules are written for English. Other languages get a notice, and only link checks apply fully.</li>
              <li>New or unusually worded scams may not match any rule.</li>
              <li>Genuine messages, especially real security alerts, can contain warning signs.</li>
              <li>We can&rsquo;t identify senders or callers, see where links lead, or check reputation databases.</li>
              <li>
                A conversation&rsquo;s context, such as whether you were expecting a parcel, isn&rsquo;t available to
                the tool.
              </li>
            </ul>
          </section>

          <section aria-labelledby="privacy-heading">
            <h2 id="privacy-heading" className="text-2xl font-bold text-navy-950">
              Privacy
            </h2>
            <p className="mt-4">
              All checks run in your browser. The text you paste isn&rsquo;t sent to ScamSpotter, saved or logged, and
              we don&rsquo;t send it to any AI service. Read the full{" "}
              <Link href="/privacy-policy" className="text-link">
                privacy policy
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </Container>
  );
}
