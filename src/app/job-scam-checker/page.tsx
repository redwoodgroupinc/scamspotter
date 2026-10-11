import Link from "next/link";
import { RuleList } from "@/components/checker/RuleList";
import { TextChecker } from "@/components/checker/TextChecker";
import { ContentSection, ToolPageLayout } from "@/components/checker/ToolPageLayout";
import { TEXT_EXAMPLES, UNREALISTIC_PAY_THRESHOLDS } from "@/lib/detection";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Job Scam Checker: Is This Job Offer Real?",
  description:
    "Paste a job advert, recruiter message or job offer to check for scam warning signs such as upfront fees, chat-only interviews, fake cheques and money-mule tasks.",
  path: "/job-scam-checker",
});

export default function JobScamCheckerPage() {
  return (
    <ToolPageLayout
      toolId="job"
      heading="Job Scam Checker"
      intro={
        <p>
          Paste a job advert, a recruiter&rsquo;s message or a job offer to check it for the warning signs that show
          up again and again in employment scams, then verify the employer independently before you share anything.
        </p>
      }
      checker={
        <TextChecker
          kind="job"
          inputLabel="Paste the job advert, recruiter message or offer"
          inputHint="Include details about pay, how the interview works and anything you're asked to pay or provide."
          placeholder="For example: We found your CV online. Earn $400 a day working from home…"
          examples={TEXT_EXAMPLES.job}
        />
      }
      howItWorks={
        <>
          <p>
            Job scams follow recognisable scripts. This checker looks for requests to pay registration, training or
            equipment fees; cheques sent to &ldquo;buy equipment&rdquo; from a particular supplier; interviews held
            only over Telegram, WhatsApp or text; requests for your bank details or identity documents before
            you&rsquo;ve had a real interview; pressure to accept immediately; and roles that involve moving money or
            parcels for someone else.
          </p>
          <p>
            It also flags pay that looks unrealistic for the work described. We only raise this when the advert also
            stresses no experience, part-time, remote or &ldquo;easy&rdquo; work, using thresholds of about{" "}
            {UNREALISTIC_PAY_THRESHOLDS.hour} per hour, {UNREALISTIC_PAY_THRESHOLDS.day} per day or{" "}
            {UNREALISTIC_PAY_THRESHOLDS.week.toLocaleString("en-US")} per week in the advertised currency.
          </p>
          <p>
            A Low result doesn&rsquo;t confirm that a job or employer is real. Scammers copy genuine job adverts and
            impersonate well-known companies, so independent verification is always the deciding step.
          </p>
          <RuleList kind="job" />
        </>
      }
    >
      <ContentSection id="verify-heading" title="How to verify an employer independently">
        <ol>
          <li>
            <strong>Find the company yourself.</strong> Search for its official website rather than using links in
            the message, and check that the job appears on its own careers page.
          </li>
          <li>
            <strong>Contact HR through official channels.</strong> Call the main number listed on the official
            website and ask whether the recruiter works there and the role is real.
          </li>
          <li>
            <strong>Check the recruiter&rsquo;s email domain.</strong> A real recruiter for a large company normally
            uses the company&rsquo;s own domain, not a free webmail address.
          </li>
          <li>
            <strong>Search for complaints.</strong> Search the company name with words like &ldquo;scam&rdquo; or
            &ldquo;complaint&rdquo;.
          </li>
          <li>
            <strong>Never pay to start a job.</strong> Genuine employers don&rsquo;t charge for training, equipment
            or background checks, and won&rsquo;t ask you to deposit a cheque and send money on.
          </li>
        </ol>
        <p>
          Read our full guide on{" "}
          <Link href="/guides/how-to-identify-a-fake-job-offer" className="text-link">
            how to identify a fake job offer
          </Link>
          , including the task scams and money-mule schemes reported by authorities in all four countries.
        </p>
      </ContentSection>
    </ToolPageLayout>
  );
}
