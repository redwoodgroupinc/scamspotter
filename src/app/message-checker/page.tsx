import Link from "next/link";
import { RuleList } from "@/components/checker/RuleList";
import { TextChecker } from "@/components/checker/TextChecker";
import { ContentSection, ToolPageLayout } from "@/components/checker/ToolPageLayout";
import { TEXT_EXAMPLES } from "@/lib/detection";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Scam Message Checker: Check a Suspicious Text for Warning Signs",
  description:
    "Paste a suspicious text, WhatsApp or social media message to check it for common scam warning signs. Free, private and runs in your browser.",
  path: "/message-checker",
});

export default function MessageCheckerPage() {
  return (
    <ToolPageLayout
      toolId="message"
      heading="Scam Message Checker"
      intro={
        <p>
          Got an unexpected text, WhatsApp or social media message? Paste it below to see which common scam warning
          signs it contains, from requests for codes and gift cards to pressure tactics and suspicious links.
        </p>
      }
      checker={
        <TextChecker
          kind="message"
          inputLabel="Paste the suspicious message"
          inputHint="Text messages, WhatsApp, Messenger, Instagram or any other chat message."
          placeholder="For example: Your parcel is on hold. Pay the redelivery fee within 24 hours…"
          examples={TEXT_EXAMPLES.message}
        />
      }
      howItWorks={
        <>
          <p>
            The checker compares your message with a documented set of rules describing tactics that scammers use again
            and again: asking for one-time codes, demanding unusual payment methods, inventing deadlines, impersonating
            banks, delivery companies and government agencies, and hiding links behind shorteners or lookalike domains.
          </p>
          <p>
            Each rule has a fixed weight. Related rules only count once, and no single rule can produce a High result on
            its own. The analysis runs entirely in your browser: ScamSpotter doesn&rsquo;t receive, store or log your
            message, and it doesn&rsquo;t use an AI model or a scam database.
          </p>
          <p>
            That also means it has limits. A new scam may not match any rule, and a genuine message can contain a
            warning sign. Treat the result as a second opinion and{" "}
            <Link href="/how-it-works" className="text-link">
              read how ScamSpotter works
            </Link>{" "}
            for the full scoring details.
          </p>
          <RuleList kind="message" />
        </>
      }
    >
      <ContentSection id="signs-heading" title="Five warning signs to look for in any message">
        <ol>
          <li>
            <strong>It&rsquo;s unexpected.</strong> You weren&rsquo;t waiting for a parcel, refund, prize or job offer.
          </li>
          <li>
            <strong>It wants something now.</strong> A deadline of hours, a threat to close your account, or a fine that
            grows if you wait.
          </li>
          <li>
            <strong>It asks for a code, a password or personal details.</strong> One-time codes are for you alone.
          </li>
          <li>
            <strong>It wants an unusual payment.</strong> Gift cards, crypto, wire transfers and &ldquo;safe
            accounts&rdquo; are favourites because the money is hard to recover.
          </li>
          <li>
            <strong>It sends you somewhere.</strong> A link, a new phone number or a request to move to WhatsApp or
            Telegram takes you out of channels you can verify.
          </li>
        </ol>
        <p>
          For a deeper explanation with examples from the US, UK, Canada and Australia, read{" "}
          <Link href="/guides/how-to-recognize-a-scam-text" className="text-link">
            how to recognise a scam text
          </Link>
          .
        </p>
      </ContentSection>
      <ContentSection id="next-heading" title="What to do with a suspicious message">
        <ul>
          <li>Don&rsquo;t tap links or call numbers in the message. Find the organisation&rsquo;s details yourself.</li>
          <li>Don&rsquo;t reply, even with STOP. Replying confirms that your number is active.</li>
          <li>
            Forward scam texts to 7726 in the US, UK and Canada, or report them to Scamwatch in Australia. Then block
            the sender and delete the message.
          </li>
          <li>
            If you&rsquo;ve already replied, paid or shared details, follow our{" "}
            <Link href="/guides/what-to-do-after-a-suspicious-message" className="text-link">
              step-by-step recovery guide
            </Link>
            .
          </li>
        </ul>
      </ContentSection>
    </ToolPageLayout>
  );
}
