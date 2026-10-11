import Link from "next/link";
import { ProsePage } from "@/components/ui/ProsePage";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Disclaimer",
  description:
    "ScamSpotter's checkers highlight common warning signs but can't confirm whether something is a scam. Read about the limits of our tools and content.",
  path: "/disclaimer",
});

export default function DisclaimerPage() {
  return (
    <ProsePage title="Disclaimer" path="/disclaimer" updated={SITE.lastReviewed}>
      <h2>Our tools can&rsquo;t prove anything is safe</h2>
      <p>
        ScamSpotter&rsquo;s checkers use a fixed set of rules to look for patterns that commonly appear in scams. They
        don&rsquo;t use a trained AI model, a scam database or any information beyond the text you provide. Scammers
        constantly change their wording, so a message can be a scam even if it receives a Low result, and a genuine
        message can trigger warning signs.
      </p>
      <p>
        The Website Safety Guide looks only at how a web address is written. It does not visit the website, check
        whether it contains malware, look up who owns the domain or consult reputation services. HTTPS, a padlock or a
        Low result does not mean a website is legitimate.
      </p>
      <p>
        The Email and Phone checkers can&rsquo;t verify who sent a message or who owns a phone number. Email addresses
        and caller ID can be forged.
      </p>

      <h2>Not professional advice</h2>
      <p>
        Our content is general information for education. It isn&rsquo;t legal, financial, tax or cybersecurity advice
        for your circumstances. If you&rsquo;ve lost money or your identity has been misused, contact your bank and the
        official services for your country, listed on our{" "}
        <Link href="/scam-prevention">scam prevention by country</Link> pages.
      </p>

      <h2>Not affiliated with any organisation</h2>
      <p>
        ScamSpotter is independent. We are not a government agency, law enforcement body, bank or regulator, and
        we&rsquo;re not affiliated with or endorsed by any company or organisation named on the site. Names such as
        banks, delivery companies and government agencies appear only to describe how scammers impersonate them.
      </p>

      <h2>Accuracy of information</h2>
      <p>
        We base our guides on published guidance from official sources and review them regularly, but organisations
        change their services, phone numbers and advice. Always check the official website linked in each guide before
        acting. If you spot something out of date, please <Link href="/contact">let us know</Link>.
      </p>

      <h2>Emergencies</h2>
      <p>
        If you are in immediate danger, or a crime is happening now, call 911 in the United States or Canada, 999 in the
        United Kingdom or 000 in Australia.
      </p>
    </ProsePage>
  );
}
