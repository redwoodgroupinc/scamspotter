import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { COUNTRIES } from "@/data/countries";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Scam Prevention by Country: US, UK, Canada and Australia",
  description:
    "Official reporting routes and scam warnings for the United States, United Kingdom, Canada and Australia, linked to government and established sources.",
  path: "/scam-prevention",
});

export default function ScamPreventionIndexPage() {
  return (
    <Container className="py-8 sm:py-10">
      <Breadcrumbs items={[{ name: "Scam prevention by country", href: "/scam-prevention" }]} />
      <div className="max-w-4xl">
        <PageHeader eyebrow="By country" title="Scam prevention by country">
          <p>
            Scams cross borders, but the help available doesn&rsquo;t. Each country has its own reporting services,
            helplines and official advice. Choose your country to see where to report, what genuine organisations say
            they will never ask for, and the scams to watch for.
          </p>
        </PageHeader>
        <ul className="grid gap-4 sm:grid-cols-2">
          {COUNTRIES.map((country) => (
            <li key={country.slug}>
              <Link href={`/scam-prevention/${country.slug}`} className="card group block h-full hover:border-brand-200 hover:bg-brand-50/40">
                <h2 className="text-xl font-semibold text-navy-950 group-hover:text-brand-700">{country.name}</h2>
                <p className="mt-2 text-sm leading-relaxed text-navy-700">{country.metaDescription}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
                  {country.shortName} scam prevention
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Container>
  );
}
