import Link from "next/link";
import { RelatedGuides } from "@/components/content/RelatedGuides";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { COUNTRIES } from "@/data/countries";
import { getAllGuides } from "@/lib/content/guides";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Scam Prevention Guides",
  description:
    "Practical, sourced guides to recognising scam texts, phishing emails, fake job offers, fake websites and payment scams, and what to do if you've been targeted.",
  path: "/guides",
});

export default function GuidesPage() {
  const guides = getAllGuides();
  return (
    <Container className="py-8 sm:py-10">
      <Breadcrumbs items={[{ name: "Scam Prevention Guides", href: "/guides" }]} />
      <div className="max-w-4xl">
        <PageHeader eyebrow="Learn" title="Scam Prevention Guides">
          <p>
            Clear, practical guides to the scams people report most often, written in plain English and checked
            against official advice from the US, UK, Canada and Australia. Each guide lists its sources so you can
            read the original guidance.
          </p>
        </PageHeader>
        <RelatedGuides guides={guides} title={`All guides (${guides.length})`} />
        <section aria-labelledby="country-guides-heading" className="mt-12">
          <h2 id="country-guides-heading" className="text-2xl font-bold text-navy-950">
            Country-specific advice
          </h2>
          <p className="mt-2 text-navy-700">
            Reporting routes and official warnings differ by country. Find the right services for where you live.
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {COUNTRIES.map((country) => (
              <li key={country.slug}>
                <Link href={`/scam-prevention/${country.slug}`} className="card block font-semibold text-navy-900 hover:border-brand-200 hover:text-brand-700">
                  {country.name} scam prevention
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Container>
  );
}
