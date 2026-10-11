import Link from "next/link";
import { ProsePage } from "@/components/ui/ProsePage";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Terms of Use",
  description: "The terms that apply when you use ScamSpotter's free scam-checking tools and scam prevention guides.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <ProsePage
      title="Terms of Use"
      path="/terms"
      updated={SITE.lastReviewed}
      intro={
        <p>
          By using {SITE.domain}, you agree to these terms. Please read them alongside our disclaimer and privacy
          policy.
        </p>
      }
    >
      <h2>What the service provides</h2>
      <p>
        ScamSpotter provides free educational content and automated tools that highlight common warning signs in
        messages and web addresses. The tools apply fixed, published rules to the text you provide. They do not
        investigate messages, contact senders, visit websites or check databases.
      </p>

      <h2>Results are information, not advice or guarantees</h2>
      <p>
        Results describe patterns found in your text. They are not a determination that something is or isn&rsquo;t a
        scam, and they are not legal, financial or security advice. A Low result does not mean a message, website or
        offer is safe, and a High result does not prove fraud. You are responsible for decisions you make, and you
        should verify anything important directly with the organisation concerned through official contact details.
      </p>

      <h2>Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>use the site for any unlawful purpose, or to develop, test or improve scams;</li>
        <li>attempt to disrupt, overload or gain unauthorised access to the site or its hosting;</li>
        <li>use automated tools to scrape the site in a way that degrades it for other visitors;</li>
        <li>misrepresent ScamSpotter&rsquo;s results as an official finding or endorsement;</li>
        <li>click on or generate traffic to advertisements other than as a genuine visitor.</li>
      </ul>

      <h2>Your content</h2>
      <p>
        Text you enter into the checkers is processed in your browser and isn&rsquo;t sent to us. Don&rsquo;t enter
        information you don&rsquo;t have the right to use, and remove sensitive personal information before checking a
        message.
      </p>

      <h2>Our content</h2>
      <p>
        The guides, tools, text and design of ScamSpotter are protected by copyright. You may share links to our pages
        and quote short extracts with a link back to the original page. Organisation names mentioned on the site belong
        to their owners and are used only to describe how scammers impersonate them.
      </p>

      <h2>Third-party websites and advertising</h2>
      <p>
        We link to official and third-party websites that we don&rsquo;t control and aren&rsquo;t responsible for.
        Advertisements shown on the site are provided by Google AdSense; their appearance isn&rsquo;t an endorsement by
        ScamSpotter.
      </p>

      <h2>Availability and changes</h2>
      <p>
        We provide the site &ldquo;as is&rdquo; and may change, suspend or withdraw any part of it at any time. We may
        update these terms; the &ldquo;last updated&rdquo; date shows when they last changed.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the extent permitted by law, ScamSpotter is not liable for any loss or damage arising from your use of, or
        reliance on, the site, its tools or its content, including losses caused by scams the tools did not flag.
        Nothing in these terms limits liability that cannot be limited under the law that applies to you.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms can be sent through our <Link href="/contact">contact page</Link>.
      </p>
    </ProsePage>
  );
}
