import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { ContentSection, ToolPageLayout } from "@/components/checker/ToolPageLayout";
import { UrlChecker } from "@/components/checker/UrlChecker";
import { Callout } from "@/components/ui/Callout";
import { requireSource } from "@/data/sources";
import { URL_EXAMPLES } from "@/lib/detection";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Website Safety Guide: Check a Web Address for Warning Signs",
  description:
    "Run preliminary checks on a web address for lookalike domains, raw IP addresses, shortened links and other warning signs, and learn how to verify a website yourself.",
  path: "/website-safety-guide",
});

const URL_PARTS = [
  { part: "https://", meaning: "The connection type. HTTPS encrypts traffic, but scam sites use it too." },
  { part: "login.", meaning: "A subdomain. The site owner can set this to anything, including a bank's name." },
  { part: "example.co.uk", meaning: "The registrable domain. This is the part that tells you who controls the site." },
  { part: "/account/verify", meaning: "The path. Anyone can put any words here, including brand names." },
];

export default function WebsiteSafetyGuidePage() {
  const safeBrowsing = requireSource("google-safe-browsing");
  const icann = requireSource("icann-lookup");
  return (
    <ToolPageLayout
      toolId="website"
      heading="Website Safety Guide"
      intro={
        <>
          <p>
            Enter a web address to run quick, local checks for common warning signs, such as a misspelled brand
            name, a raw IP address, a shortened link or a government-sounding name on a non-government domain. Then
            use the guide below to check the site properly.
          </p>
          <Callout tone="info" className="mt-4" title="Preliminary indicators, not a verdict">
            ScamSpotter does not visit, download or follow the address you enter, so it can&rsquo;t see the page
            itself or check a reputation database. Results describe how the address is written. They can&rsquo;t
            tell you that a site is safe, malware-free or fraudulent.
          </Callout>
        </>
      }
      checker={<UrlChecker examples={URL_EXAMPLES} />}
      howItWorks={
        <>
          <p>
            The address is parsed in your browser using the same rules browsers use. We then check its structure:
            whether it uses HTTPS, whether the host is a raw IP address, whether an &ldquo;@&rdquo; hides the real
            destination, whether it&rsquo;s a known link shortener, whether it uses international characters that
            can imitate familiar letters, and whether the domain resembles one of the banks, delivery companies,
            government services and tech brands on our list.
          </p>
          <p>
            Each warning sign has a documented weight, and the total gives a preliminary indicator level of Low,
            Medium or High. Shortened links are always marked as &ldquo;destination hidden&rdquo;, because we
            deliberately don&rsquo;t follow them.
          </p>
          <p>
            Our brand list is small and our domain-suffix list is simplified, so a missing warning doesn&rsquo;t
            mean an address is genuine. See{" "}
            <Link href="/how-it-works" className="text-link">
              how ScamSpotter works
            </Link>{" "}
            for the full list of checks.
          </p>
        </>
      }
    >
      <ContentSection id="anatomy-heading" title="How to read a web address">
        <p>
          The most important skill for spotting fake websites is finding the <strong>registrable domain</strong>: the
          name just before the first single slash, together with its ending (such as .com, .co.uk, .ca or .com.au).
          Everything to the left of it can be chosen freely by whoever owns that domain.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] border-collapse text-left text-base">
            <caption className="sr-only">Parts of the example address https://login.example.co.uk/account/verify</caption>
            <thead>
              <tr className="border-b-2 border-navy-200">
                <th scope="col" className="py-2 pr-4">
                  Part
                </th>
                <th scope="col" className="py-2">
                  What it tells you
                </th>
              </tr>
            </thead>
            <tbody>
              {URL_PARTS.map((row) => (
                <tr key={row.part} className="border-b border-navy-100 align-top">
                  <td className="py-2 pr-4 font-mono text-sm font-semibold whitespace-nowrap">{row.part}</td>
                  <td className="py-2">{row.meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          So <span className="font-mono text-base">paypal.com.account-check.example</span> belongs to
          account-check.example, not PayPal, and <span className="font-mono text-base">example.com/paypal</span> is
          simply a page on example.com.
        </p>
      </ContentSection>

      <ContentSection id="https-heading" title="Why the padlock isn't proof">
        <p>
          HTTPS and the padlock icon mean your connection to the site is encrypted, so others on the network
          can&rsquo;t read what you send. They don&rsquo;t mean the site is honest. Certificates are free and quick to
          get, and phishing sites routinely use them. Treat a missing HTTPS connection as a reason not to enter
          details, but never treat HTTPS as a reason to trust a site.
        </p>
      </ContentSection>

      <ContentSection id="verify-site-heading" title="How to check a website before you trust it">
        <ol>
          <li>
            <strong>Get there yourself.</strong> Type the organisation&rsquo;s address or use a bookmark or its
            official app, rather than following a link from a message or advert.
          </li>
          <li>
            <strong>Look up the domain&rsquo;s age.</strong>{" "}
            <a href={icann.url} rel="noopener noreferrer" className="text-link inline-flex items-center gap-1">
              ICANN Lookup
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>{" "}
            shows registration data for many domains, often including the creation date. A shop or bank that
            registered its domain a few weeks ago deserves extra caution.
          </li>
          <li>
            <strong>Check known-unsafe lists.</strong> Google&rsquo;s{" "}
            <a href={safeBrowsing.url} rel="noopener noreferrer" className="text-link inline-flex items-center gap-1">
              Safe Browsing site status
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>{" "}
            tool shows whether Google currently considers a site dangerous. A clean result only means it hasn&rsquo;t
            been flagged yet.
          </li>
          <li>
            <strong>Read independent reviews.</strong> Search the site&rsquo;s name with &ldquo;reviews&rdquo;,
            &ldquo;scam&rdquo; or &ldquo;complaints&rdquo;, and don&rsquo;t rely on reviews shown on the site itself.
          </li>
          <li>
            <strong>Check contact details and policies.</strong> Look for a real address, a working phone number,
            clear returns terms and a privacy policy. Missing or copied details are warning signs.
          </li>
          <li>
            <strong>Watch how it asks you to pay.</strong> Bank transfers, crypto and gift cards offer little
            protection. Credit cards and well-known payment services usually give you a way to dispute a charge.
          </li>
        </ol>
        <p>
          For more detail, see{" "}
          <Link href="/guides/how-to-verify-a-suspicious-website" className="text-link">
            how to verify a suspicious website
          </Link>{" "}
          and{" "}
          <Link href="/guides/online-shopping-scam-warning-signs" className="text-link">
            online shopping warning signs
          </Link>
          .
        </p>
      </ContentSection>

      <ContentSection id="report-site-heading" title="Reporting a fake website">
        <ul>
          <li>
            <strong>UK:</strong> report the address to the National Cyber Security Centre&rsquo;s suspicious website
            service.
          </li>
          <li>
            <strong>US:</strong> report scams to the FTC at ReportFraud.ftc.gov, and to the FBI&rsquo;s IC3 if you
            lost money online.
          </li>
          <li>
            <strong>Canada:</strong> report to the Canadian Anti-Fraud Centre.
          </li>
          <li>
            <strong>Australia:</strong> Scamwatch&rsquo;s report form includes an option for reporting a website.
          </li>
        </ul>
      </ContentSection>
    </ToolPageLayout>
  );
}
