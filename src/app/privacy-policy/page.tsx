import Link from "next/link";
import { ProsePage } from "@/components/ui/ProsePage";
import { getAdsConfig } from "@/lib/ads/config";
import { getHostingProvider } from "@/lib/hosting";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "How ScamSpotter handles information: checks run in your browser, we don't store the text you check, and how hosting and advertising technologies process technical data.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  const ads = getAdsConfig();
  const host = getHostingProvider();
  const hostName = host?.name ?? "our hosting provider";
  const HostName = host?.name ?? "Our hosting provider";
  return (
    <ProsePage
      title="Privacy Policy"
      path="/privacy-policy"
      updated={SITE.lastReviewed}
      intro={
        <p>
          This policy explains what information is processed when you use {SITE.domain}, who processes it and why. We
          have tried to describe what the site actually does, without legal jargon.
        </p>
      }
    >
      <h2>The short version</h2>
      <ul>
        <li>
          You don&rsquo;t need an account, and we don&rsquo;t ask for your name or contact details to use the tools.
        </li>
        <li>
          The text, email addresses and web addresses you check are analysed by JavaScript running in your own browser.
          They are not sent to ScamSpotter&rsquo;s servers, stored, logged or shared with an AI service.
        </li>
        <li>
          Like any website, our hosting provider processes technical information such as IP addresses to deliver pages
          and protect the service.
        </li>
        <li>
          {ads.enabled
            ? "The site shows Google AdSense advertising, which uses cookies and similar technologies, as explained below."
            : "Advertising is not currently enabled. If we add Google AdSense in future, we will update this policy before it goes live."}
        </li>
      </ul>

      <h2>Information you enter into our checkers</h2>
      <p>
        When you use the Message, Email, Job, Phone or Website checkers, the analysis happens on your device. The text
        stays in your browser&rsquo;s memory while the page is open and disappears when you clear it, reload or leave
        the page. ScamSpotter does not save it in cookies or browser storage, and we don&rsquo;t keep a history of
        checks.
      </p>
      <p>
        The Website Safety Guide never visits, downloads or follows the address you enter. If you click &ldquo;Copy
        results&rdquo;, the results are copied to your device&rsquo;s clipboard only.
      </p>
      <p>
        Even though we don&rsquo;t receive it, please remove passwords, verification codes, bank or card details,
        identity numbers and other personal information before you paste a message.
      </p>

      <h2>Information processed by our hosting provider</h2>
      <p>
        {host && <>ScamSpotter is hosted on {host.name}. </>}When your browser requests a page, {hostName} receives
        standard technical information, including your IP address, the page requested, the date and time, and your
        browser&rsquo;s user agent. {HostName} uses this to deliver the site, keep it secure (for example, to prevent
        abuse and denial-of-service attacks) and diagnose problems.{" "}
        {host && (
          <>
            {host.name} describes its practices in its{" "}
            <a href={host.privacyUrl} rel="noopener noreferrer">
              privacy policy
            </a>
            .{" "}
          </>
        )}
        The text you check is not part of these requests.
      </p>
      <p>
        Our fonts and scripts are served from our own domain, so loading a page doesn&rsquo;t contact third-party font
        or analytics services. We don&rsquo;t currently use any analytics or visitor-tracking tools. If that changes, we
        will update this policy first.
      </p>

      <h2>Advertising</h2>
      {ads.enabled ? (
        <>
          <p>
            We use Google AdSense to show advertisements. Google and its partners use cookies and similar technologies
            to serve ads, limit how often you see them, measure their performance and prevent fraud. Depending on your
            settings and location, Google may personalise ads based on your activity on this and other websites.
          </p>
          <p>
            When you visit a page with ads, your browser sends information such as the page address and your IP address
            to Google. Google explains this in{" "}
            <a href="https://policies.google.com/technologies/partner-sites" rel="noopener noreferrer">
              how Google uses information from sites or apps that use its services
            </a>{" "}
            and its{" "}
            <a href="https://policies.google.com/technologies/ads" rel="noopener noreferrer">
              advertising policies
            </a>
            , which also describe how to control ad personalisation.
          </p>
          <p>
            Where the law requires consent for advertising cookies (for example in the UK and European Economic Area), a
            consent message is shown before personalised advertising is used, and you can change your choice later.
          </p>
        </>
      ) : (
        <p>
          The site does not currently show advertising. We plan to use Google AdSense in future to cover running costs.
          Before ads are switched on, this section will be updated to explain how Google uses cookies and similar
          technologies, and visitors in regions that require consent will be asked for it.
        </p>
      )}

      <h2>Cookies and browser storage</h2>
      <p>
        ScamSpotter itself does not set cookies or use your browser&rsquo;s local storage.{" "}
        {ads.enabled
          ? "Google's advertising services may set or read cookies and similar identifiers, as described above."
          : "Because advertising isn't enabled, no advertising cookies are used."}
      </p>

      <h2>If you contact us</h2>
      <p>
        If you email us, we receive your email address and whatever you include in your message. We use it only to read
        and respond to your message and to improve the site, and we don&rsquo;t add you to mailing lists. Please
        don&rsquo;t send sensitive personal information.
      </p>

      <h2>Links to other websites</h2>
      <p>
        Our guides link to government agencies and other organisations. Their websites have their own privacy policies,
        which apply when you visit them.
      </p>

      <h2>Children</h2>
      <p>
        ScamSpotter is a general-audience educational site. It is not directed at children under 13, and we don&rsquo;t
        knowingly collect personal information from children.
      </p>

      <h2>Your rights</h2>
      <p>
        Depending on where you live, privacy laws such as the UK GDPR, the Australian Privacy Act, Canada&rsquo;s PIPEDA
        or US state privacy laws may give you rights to access or delete personal information about you. Because we
        don&rsquo;t keep accounts or the text you check, we usually hold very little information. You can contact us
        using the details on our <Link href="/contact">contact page</Link>. For information processed by {hostName}
        {ads.enabled ? " or Google" : ""}, you can also use the options described in{" "}
        {ads.enabled ? "their privacy policies" : "its privacy policy"}.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We will update this page if the way the site handles information changes, and change the &ldquo;last
        updated&rdquo; date above.
      </p>
    </ProsePage>
  );
}
