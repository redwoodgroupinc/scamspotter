import { ArrowRight, EyeOff, ListChecks, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";
import { TextChecker } from "@/components/checker/TextChecker";
import { RelatedGuides } from "@/components/content/RelatedGuides";
import { ToolCards } from "@/components/content/ToolCards";
import { JsonLd } from "@/components/seo/JsonLd";
import { Callout } from "@/components/ui/Callout";
import { Container } from "@/components/ui/Container";
import { COUNTRIES } from "@/data/countries";
import { requireSource } from "@/data/sources";
import { getAllGuides } from "@/lib/content/guides";
import { TEXT_EXAMPLES } from "@/lib/detection";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl, SITE } from "@/lib/site";

export const metadata = pageMetadata({
  title: "ScamSpotter: Is It a Scam? Free Scam Message Checker",
  description:
    "Paste a suspicious text, email, job offer or web address to check it for common scam warning signs. Free, private, runs in your browser, with guides for the US, UK, Canada and Australia.",
  path: "/",
  absoluteTitle: true,
});

const FAQS = [
  {
    question: "Is ScamSpotter free?",
    answer:
      "Yes. All of the checkers and guides are free and you don't need an account. The site may show clearly labelled advertising to cover running costs.",
  },
  {
    question: "Does ScamSpotter see or store the messages I check?",
    answer:
      "No. The checks run in your web browser using JavaScript, so the text you paste isn't sent to our servers, stored or logged. Our hosting provider does process standard technical data, such as IP addresses and the pages you request, as described in our privacy policy. Even so, please remove passwords, codes, bank details and ID numbers before pasting.",
  },
  {
    question: "Can ScamSpotter tell me for certain whether a message is a scam?",
    answer:
      "No tool can do that from the text alone. ScamSpotter looks for warning signs that are common in scams and explains each one. A message with no warning signs can still be a scam, and a genuine message can contain a warning sign.",
  },
  {
    question: "How is the warning-sign level worked out?",
    answer:
      "Each rule has a published weight from 1 (weak) to 4 (critical). We add up the strongest sign in each group: 0 to 2 is Low, 3 to 6 is Medium, and 7 or more is High. No single rule can produce a High result on its own.",
  },
  {
    question: "Does ScamSpotter use AI?",
    answer:
      "No. It uses transparent, hand-written rules rather than a trained AI model, and it doesn't send your text to any AI service or scam database. That makes it private and predictable, but it also means it can miss new scam wording.",
  },
  {
    question: "What should I do if I've already paid or shared my details?",
    answer:
      "Contact your bank or card provider straight away using the number on your card, change any passwords you shared, and report the scam to the official service in your country. Our guide on what to do after a suspicious message has step-by-step advice.",
  },
];

export default function HomePage() {
  const guides = getAllGuides().slice(0, 6);
  return (
    <>
      <section className="border-b border-navy-100 bg-gradient-to-b from-navy-50 to-white">
        <Container className="py-10 sm:py-14">
          <div className="max-w-3xl">
            <p className="eyebrow">{SITE.tagline}</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-navy-950 sm:text-5xl">
              Is It a Scam? Find the Warning Signs.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-navy-700 sm:text-xl">
              Paste a suspicious text, WhatsApp or social media message to check it for the tactics scammers use most,
              and learn how to recognise common fraud before it costs you. Free, private and explained in plain
              English.
            </p>
          </div>
          <div className="mt-8 max-w-3xl">
            <TextChecker
              kind="message"
              inputLabel="Paste a suspicious message"
              inputHint="Texts, WhatsApp, Messenger or social media messages. Use our other checkers for emails, job offers and web addresses."
              placeholder="For example: Your account has been locked. Verify your details within 24 hours at…"
              examples={TEXT_EXAMPLES.message}
            />
          </div>
          <Callout tone="info" className="mt-6 max-w-3xl" title="What this checker can and can't do">
            ScamSpotter looks for common warning signs using transparent, local rules. It isn&rsquo;t a trained AI
            model or a scam database, it can&rsquo;t prove that a message is genuine, and a Low result never means
            something is safe. If in doubt, contact the organisation using details you find yourself.
          </Callout>
        </Container>
      </section>

      <Container className="py-14">
        <section aria-labelledby="tools-heading">
          <h2 id="tools-heading" className="text-3xl font-bold tracking-tight text-navy-950">
            Free scam-checking tools
          </h2>
          <p className="mt-2 max-w-3xl text-lg text-navy-700">
            Different scams leave different clues. Each checker is tuned for one kind of message.
          </p>
          <div className="mt-6">
            <ToolCards />
          </div>
        </section>

        <section aria-labelledby="how-heading" className="mt-16">
          <h2 id="how-heading" className="text-3xl font-bold tracking-tight text-navy-950">
            How ScamSpotter works
          </h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            <li className="card">
              <ListChecks className="h-8 w-8 text-brand-600" aria-hidden="true" />
              <h3 className="mt-3 text-lg font-semibold text-navy-950">Transparent rules</h3>
              <p className="mt-2 text-navy-700">
                Every warning sign we look for is published with its weight, so you can see exactly why a message
                scored the way it did.
              </p>
            </li>
            <li className="card">
              <EyeOff className="h-8 w-8 text-brand-600" aria-hidden="true" />
              <h3 className="mt-3 text-lg font-semibold text-navy-950">Private by design</h3>
              <p className="mt-2 text-navy-700">
                The analysis runs in your browser. Your message isn&rsquo;t uploaded, stored or shared with an AI
                service.
              </p>
            </li>
            <li className="card">
              <ShieldAlert className="h-8 w-8 text-brand-600" aria-hidden="true" />
              <h3 className="mt-3 text-lg font-semibold text-navy-950">Honest about limits</h3>
              <p className="mt-2 text-navy-700">
                We point out warning signs and next steps. We never claim a message is definitely safe or definitely
                a scam.
              </p>
            </li>
          </ul>
          <p className="mt-4">
            <Link href="/how-it-works" className="btn-quiet">
              Read how scoring works
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </p>
        </section>

        <AdSlot placement="home" />

        <RelatedGuides guides={guides} title="Latest scam prevention guides" />
        <p className="mt-4">
          <Link href="/guides" className="btn-quiet">
            See all guides
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </p>

        <section aria-labelledby="countries-heading" className="mt-16">
          <h2 id="countries-heading" className="text-3xl font-bold tracking-tight text-navy-950">
            Scam help in your country
          </h2>
          <p className="mt-2 max-w-3xl text-lg text-navy-700">
            Reporting services and official warnings differ between countries. Here&rsquo;s where to start.
          </p>
          <ul className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {COUNTRIES.map((country) => (
              <li key={country.code} className="card flex flex-col">
                <h3 className="text-xl font-semibold text-navy-950">{country.name}</h3>
                <ul className="mt-3 flex-1 space-y-3 text-sm">
                  {country.reporting.slice(0, 2).map((channel) => (
                    <li key={channel.name}>
                      <a
                        href={requireSource(channel.source).url}
                        rel="noopener noreferrer"
                        className="text-link"
                      >
                        {channel.name}
                      </a>
                      <p className="mt-0.5 text-navy-700">{channel.useFor}</p>
                    </li>
                  ))}
                </ul>
                <Link href={`/scam-prevention/${country.slug}`} className="btn-quiet mt-4 self-start">
                  {country.shortName} scam prevention
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="faq-heading" className="mt-16 max-w-3xl">
          <h2 id="faq-heading" className="text-3xl font-bold tracking-tight text-navy-950">
            Frequently asked questions
          </h2>
          <div className="mt-6 divide-y divide-navy-100 rounded-2xl border border-navy-100">
            {FAQS.map((faq) => (
              <details key={faq.question} className="group p-5">
                <summary className="cursor-pointer text-lg font-semibold text-navy-950 marker:text-brand-600">
                  {faq.question}
                </summary>
                <p className="mt-3 leading-relaxed text-navy-800">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section aria-labelledby="privacy-heading" className="mt-16 max-w-3xl">
          <h2 id="privacy-heading" className="text-2xl font-bold text-navy-950">
            Privacy and safety
          </h2>
          <div className="mt-3 space-y-3 leading-relaxed text-navy-800">
            <p>
              ScamSpotter doesn&rsquo;t require an account and doesn&rsquo;t store the text you check. We still ask
              you to remove passwords, one-time codes, bank and card details and ID numbers before pasting anything,
              because you should never need to share those to check a message.
            </p>
            <p>
              ScamSpotter is an educational resource, not a government service, bank or law enforcement agency. We
              can&rsquo;t investigate scams or recover money. Read our{" "}
              <Link href="/privacy-policy" className="text-link">
                privacy policy
              </Link>{" "}
              and{" "}
              <Link href="/disclaimer" className="text-link">
                disclaimer
              </Link>{" "}
              for details.
            </p>
          </div>
        </section>
      </Container>

      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE.name,
            url: SITE.url,
            description: SITE.description,
            inLanguage: "en",
          },
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: SITE.name,
            url: SITE.url,
            logo: absoluteUrl("/icon.svg"),
            slogan: SITE.tagline,
          },
        ]}
      />
    </>
  );
}
