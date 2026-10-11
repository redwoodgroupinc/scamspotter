import Link from "next/link";
import { RuleList } from "@/components/checker/RuleList";
import { TextChecker } from "@/components/checker/TextChecker";
import { ContentSection, ToolPageLayout } from "@/components/checker/ToolPageLayout";
import { Callout } from "@/components/ui/Callout";
import { TEXT_EXAMPLES } from "@/lib/detection";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Email Scam Checker: Look for Phishing Warning Signs",
  description:
    "Paste a suspicious email and, optionally, the sender address to check for phishing warning signs such as credential requests, payment demands and lookalike domains.",
  path: "/email-checker",
});

export default function EmailCheckerPage() {
  return (
    <ToolPageLayout
      toolId="email"
      heading="Email Scam Checker"
      intro={
        <>
          <p>
            Paste the text of a suspicious email to check it for common phishing warning signs. Add the sender
            address if you have it, and we&rsquo;ll also look for patterns such as lookalike domains or a company
            writing from a personal mailbox.
          </p>
          <Callout tone="info" className="mt-4">
            Pasted text alone can&rsquo;t prove whether an email is genuine. Sender addresses can be forged, and real
            accounts can be hacked. This checker doesn&rsquo;t read email headers, open attachments, check sender
            reputation or look up who owns a domain.
          </Callout>
        </>
      }
      checker={
        <TextChecker
          kind="email"
          inputLabel="Paste the email text"
          inputHint="Copy the body of the email. You can leave out signatures and long legal footers."
          placeholder="For example: Dear Customer, we detected unusual activity on your account…"
          examples={TEXT_EXAMPLES.email}
          showSender
        />
      }
      howItWorks={
        <>
          <p>
            The email checker uses the same transparent rule set as our message checker, plus rules for tactics
            that are common in email: pushing you to open an unexpected invoice or voicemail attachment, asking you
            to &ldquo;enable content&rdquo;, warning that your mailbox is full or your password is expiring, and
            announcing that a supplier&rsquo;s bank details have changed.
          </p>
          <p>
            If you enter a sender address, we check only how it&rsquo;s written: whether it imitates a well-known
            brand, uses a government-sounding name on a non-government domain, hides a different address in the
            display name, or comes from a free personal mailbox while the message claims to be from an organisation.
          </p>
          <p>
            Everything runs in your browser. We don&rsquo;t send the email anywhere, and we can&rsquo;t see the
            technical headers that email providers use to check authenticity.
          </p>
          <RuleList kind="email" />
        </>
      }
    >
      <ContentSection id="manual-heading" title="How to check a suspicious email yourself">
        <ol>
          <li>
            <strong>Read the full sender address,</strong> not just the name. On a phone, tap the sender name to
            reveal it.
          </li>
          <li>
            <strong>Preview links without clicking.</strong> On a computer, hover over a link to see where it really
            goes. Focus on the domain just before the first single slash.
          </li>
          <li>
            <strong>Ask whether you were expecting it.</strong> Unexpected invoices, delivery notices, password
            resets and refunds are the most common lures.
          </li>
          <li>
            <strong>Contact the organisation separately.</strong> Use the app, a bookmark or a phone number from a
            statement, never the details in the email.
          </li>
        </ol>
        <p>
          Our guide to{" "}
          <Link href="/guides/how-to-recognize-phishing-emails" className="text-link">
            recognising phishing emails
          </Link>{" "}
          goes through each of these in more detail.
        </p>
      </ContentSection>
      <ContentSection id="report-email-heading" title="Reporting phishing emails">
        <ul>
          <li>
            <strong>UK:</strong> forward to report@phishing.gov.uk (the NCSC&rsquo;s Suspicious Email Reporting
            Service).
          </li>
          <li>
            <strong>US:</strong> the FTC recommends forwarding to reportphishing@apwg.org and reporting at
            ReportFraud.ftc.gov.
          </li>
          <li>
            <strong>Canada:</strong> report to the Canadian Anti-Fraud Centre through the national reporting system.
          </li>
          <li>
            <strong>Australia:</strong> report to Scamwatch. Fake ATO emails can also be forwarded to
            ReportScams@ato.gov.au.
          </li>
        </ul>
      </ContentSection>
    </ToolPageLayout>
  );
}
