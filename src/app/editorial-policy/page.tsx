import Link from "next/link";
import { ProsePage } from "@/components/ui/ProsePage";
import { SOURCES_LAST_VERIFIED } from "@/data/sources";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Editorial Policy",
  description:
    "How ScamSpotter researches, sources, reviews and corrects its scam prevention guides and country pages.",
  path: "/editorial-policy",
});

export default function EditorialPolicyPage() {
  return (
    <ProsePage
      title="Editorial Policy"
      path="/editorial-policy"
      updated={SITE.lastReviewed}
      intro={
        <p>
          Scam advice is only useful if it&rsquo;s accurate. This page explains how we create and maintain our content.
        </p>
      }
    >
      <h2>Sources we rely on</h2>
      <p>
        Our guides and country pages are based on published guidance from government agencies, regulators, police
        reporting services and established non-profit organisations, such as the Federal Trade Commission, the National
        Cyber Security Centre, the Canadian Anti-Fraud Centre and Scamwatch. Every guide lists the sources it relies on,
        with links so you can read the original advice.
      </p>
      <p>
        We check that each linked source exists and supports what we cite it for. Our source list was last checked on{" "}
        {formatDate(SOURCES_LAST_VERIFIED)}.
      </p>

      <h2>What we won&rsquo;t do</h2>
      <ul>
        <li>We don&rsquo;t invent statistics, quotes, case studies, testimonials or reviews.</li>
        <li>We don&rsquo;t present our own examples as real messages. Illustrative examples are labelled as such.</li>
        <li>We don&rsquo;t claim that our tools can confirm whether something is safe or a scam.</li>
        <li>We don&rsquo;t publish thin pages that simply swap one country name for another.</li>
        <li>
          We don&rsquo;t let advertisers influence what we write. Advertising is provided automatically by Google
          AdSense, and we don&rsquo;t accept paid placements or sponsored guides.
        </li>
      </ul>

      <h2>How content is produced</h2>
      <p>
        Guides are written in plain English for a general audience in the US, UK, Canada and Australia. We may use
        writing tools, including AI assistants, to help draft and edit text, but published content is checked against
        the official sources it cites, and the scam-checking tools themselves use fixed, published rules rather than AI.
      </p>
      <p>
        Each guide shows when it was published and, if it has changed meaningfully, when it was last updated. Guides are
        published by ScamSpotter rather than named individuals, and we don&rsquo;t claim professional credentials we
        don&rsquo;t have.
      </p>

      <h2>Reviews and corrections</h2>
      <p>
        Official reporting routes change. For example, the UK&rsquo;s Action Fraud service was replaced by Report Fraud
        in December 2025. We review our guides and country pages regularly and update them when guidance changes.
      </p>
      <p>
        If you find an error, please <Link href="/contact">contact us</Link> with the page and, if possible, a link to
        an official source. We correct factual errors promptly and update the page&rsquo;s date.
      </p>

      <h2>How the checkers are maintained</h2>
      <p>
        The detection rules are published on <Link href="/how-it-works">How ScamSpotter Works</Link>. Rule changes are
        tested against examples of both suspicious and legitimate messages to reduce false alarms, and we don&rsquo;t
        change rules to make results look more dramatic.
      </p>
    </ProsePage>
  );
}
