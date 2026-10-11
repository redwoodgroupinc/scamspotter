import Link from "next/link";
import { ProsePage } from "@/components/ui/ProsePage";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = pageMetadata({
  title: "About ScamSpotter",
  description:
    "ScamSpotter is a free, privacy-first resource that helps people in the US, UK, Canada and Australia recognise the warning signs of scams.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <ProsePage
      title="About ScamSpotter"
      path="/about"
      updated={SITE.lastReviewed}
      intro={
        <p>{SITE.tagline} ScamSpotter helps people slow down, spot the warning signs and check before they act.</p>
      }
    >
      <h2>What ScamSpotter does</h2>
      <p>
        Scam messages are designed to make you act quickly: tap the link, pay the fee, read out the code. ScamSpotter
        gives you a moment to pause. Our free checkers look at a suspicious text, email, job offer, phone message or web
        address and point out the specific features that commonly appear in scams, with a plain-English explanation of
        each one and practical next steps.
      </p>
      <p>
        Alongside the tools, we publish <Link href="/guides">scam prevention guides</Link> and{" "}
        <Link href="/scam-prevention">country pages</Link> for the United States, United Kingdom, Canada and Australia,
        so you can find the official reporting services where you live.
      </p>

      <h2>What ScamSpotter is not</h2>
      <ul>
        <li>
          <strong>It isn&rsquo;t a verdict.</strong> Our checkers find warning signs; they can&rsquo;t prove a message
          is genuine or fraudulent. A Low result never means something is safe.
        </li>
        <li>
          <strong>It isn&rsquo;t AI or a scam database.</strong> We use transparent, published rules. You can read every
          one on <Link href="/how-it-works">How ScamSpotter Works</Link>.
        </li>
        <li>
          <strong>It isn&rsquo;t an official service.</strong> ScamSpotter isn&rsquo;t a government agency, bank, police
          force or consumer body, and we aren&rsquo;t affiliated with any organisation mentioned on the site. We
          can&rsquo;t investigate scams, contact scammers or recover money.
        </li>
      </ul>

      <h2>Our principles</h2>
      <ul>
        <li>
          <strong>Privacy first.</strong> Checks run in your browser. We don&rsquo;t ask for an account, and we
          don&rsquo;t store or log the text you check.
        </li>
        <li>
          <strong>Honesty about limits.</strong> We explain what each tool can and can&rsquo;t do, and we never use fake
          reviews, invented statistics or misleading security badges.
        </li>
        <li>
          <strong>Official sources.</strong> Our guides are based on published advice from government agencies,
          regulators and established non-profit organisations, and each guide lists its sources. See our{" "}
          <Link href="/editorial-policy">editorial policy</Link>.
        </li>
      </ul>

      <h2>How ScamSpotter is funded</h2>
      <p>
        ScamSpotter is free to use. To cover running costs, the site may display advertising from Google AdSense. Ads
        are clearly labelled, are kept away from the checkers&rsquo; input boxes and buttons, and have no influence on
        our tools or guides. We don&rsquo;t sell data and we don&rsquo;t accept payment to feature or promote any
        company. Our <Link href="/privacy-policy">privacy policy</Link> explains how advertising works on the site.
      </p>

      <h2>Get in touch</h2>
      <p>
        Spotted an error or have a suggestion? Visit our <Link href="/contact">contact page</Link>. If you need help
        with a scam, please use the official reporting services listed on our{" "}
        <Link href="/scam-prevention">country pages</Link>.
      </p>
    </ProsePage>
  );
}
