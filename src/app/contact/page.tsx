import Link from "next/link";
import { ReportingOptions } from "@/components/content/ReportingOptions";
import { Callout } from "@/components/ui/Callout";
import { ProsePage } from "@/components/ui/ProsePage";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Contact ScamSpotter",
  description:
    "How to contact ScamSpotter about corrections, feedback and site questions, and where to report a scam to the authorities instead.",
  path: "/contact",
});

export default function ContactPage() {
  const email = SITE.contactEmail;
  return (
    <ProsePage
      title="Contact ScamSpotter"
      path="/contact"
      intro={<p>We welcome corrections, suggestions for new guides and feedback about our tools.</p>}
    >
      <div className="not-prose">
        <Callout tone="warning" title="Need help with a scam right now?">
          ScamSpotter can&rsquo;t investigate scams, stop payments or recover money. If you&rsquo;ve lost money or
          shared bank details, contact your bank immediately using the number on your card, then report it to the
          official service in your country (listed below). In an emergency, call 911 in the US and Canada, 999 in the UK
          or 000 in Australia.
        </Callout>
      </div>

      <h2>Email</h2>
      {email ? (
        <p>
          Write to us at <a href={`mailto:${email}`}>{email}</a>. We read every message, but we can&rsquo;t promise a
          reply to all of them.
        </p>
      ) : (
        <p>
          A contact email address for ScamSpotter hasn&rsquo;t been published yet. Please check back soon. In the
          meantime, the official reporting services below can help with any scam you&rsquo;ve encountered.
        </p>
      )}

      <h2>Please don&rsquo;t send sensitive information</h2>
      <p>
        Never email us passwords, verification codes, bank or card details, or identity numbers. If you&rsquo;re sending
        an example of a scam message, remove your personal details first. We will never contact you to ask for money,
        codes or personal information. Anyone who does so while claiming to be ScamSpotter is a scammer.
      </p>

      <h2>Corrections</h2>
      <p>
        If you think something on ScamSpotter is wrong or out of date, tell us which page and what you believe is
        incorrect, ideally with a link to an official source. Our <Link href="/editorial-policy">editorial policy</Link>{" "}
        explains how we handle corrections.
      </p>
      <div className="not-prose">
        <ReportingOptions title="Report a scam to the authorities" />
      </div>
    </ProsePage>
  );
}
