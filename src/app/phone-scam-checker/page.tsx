import Link from "next/link";
import { RuleList } from "@/components/checker/RuleList";
import { TextChecker } from "@/components/checker/TextChecker";
import { ContentSection, ToolPageLayout } from "@/components/checker/ToolPageLayout";
import { Callout } from "@/components/ui/Callout";
import { TEXT_EXAMPLES } from "@/lib/detection";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Phone Scam Message Checker: Check a Voicemail or Caller's Message",
  description:
    "Paste a voicemail transcript or what a caller said to check for impersonation, threats, payment demands and requests for verification codes.",
  path: "/phone-scam-checker",
});

export default function PhoneScamCheckerPage() {
  return (
    <ToolPageLayout
      toolId="phone"
      heading="Phone Scam Message Checker"
      intro={
        <>
          <p>
            Received a voicemail, a recorded call or a text from someone claiming to be your bank, the police, a tax
            office or a tech company? Type or paste what they said to check it for common phone scam tactics.
          </p>
          <Callout tone="info" className="mt-4">
            This tool checks the words of a message only. It can&rsquo;t identify a caller, look up who owns a phone
            number or tell you whether a number is genuine. Caller ID can be faked to show any number, including a real
            bank or government line.
          </Callout>
        </>
      }
      checker={
        <TextChecker
          kind="phone"
          inputLabel="Paste or type what the caller said"
          inputHint="A voicemail transcript, notes from the call or the text that came with a missed call."
          placeholder="For example: This is the fraud team at your bank. Your account has been compromised…"
          examples={TEXT_EXAMPLES.phone}
        />
      }
      howItWorks={
        <>
          <p>
            Phone scams rely on a handful of scripts: an official-sounding caller, an alarming problem, pressure to act
            before you hang up, and a request for money, a code or remote access to your device. The checker looks for
            these patterns, including claims that your Social Security, Social Insurance or National Insurance number
            has been suspended, threats of arrest, instructions to move money to a &ldquo;safe account&rdquo;, requests
            to read out a one-time code, &ldquo;press 1&rdquo; robocalls and requests to stay on the line.
          </p>
          <p>
            The analysis runs in your browser and nothing you type is sent to ScamSpotter. As with all our checkers, a
            Low result doesn&rsquo;t mean a call was genuine.
          </p>
          <RuleList kind="phone" />
        </>
      }
    >
      <ContentSection id="callback-heading" title="The safest way to check a call">
        <ol>
          <li>Hang up. A genuine organisation won&rsquo;t mind you calling back.</li>
          <li>
            Find the number yourself: the back of your bank card, a statement, or the organisation&rsquo;s official
            website.
          </li>
          <li>
            If you can, call from a different phone, or wait a few minutes first. The Canadian Anti-Fraud Centre
            suggests waiting 10 minutes, because some scammers try to keep the line open.
          </li>
          <li>In the UK, you can dial 159 to be connected to most banks&rsquo; fraud teams safely.</li>
        </ol>
        <p>
          Our guide on{" "}
          <Link href="/guides/how-to-verify-a-message-from-your-bank" className="text-link">
            how to verify a message or call from your bank
          </Link>{" "}
          covers this in detail.
        </p>
      </ContentSection>
    </ToolPageLayout>
  );
}
