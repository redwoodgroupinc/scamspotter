import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/ads/AdSlot";
import { RelatedGuides } from "@/components/content/RelatedGuides";
import { SourceList } from "@/components/content/SourceList";
import { ToolCards } from "@/components/content/ToolCards";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Callout } from "@/components/ui/Callout";
import { Container } from "@/components/ui/Container";
import { COUNTRIES, getCountry } from "@/data/countries";
import { requireSource } from "@/data/sources";
import { getAllGuides } from "@/lib/content/guides";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

interface CountryPageProps {
  params: Promise<{ country: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return COUNTRIES.map((country) => ({ country: country.slug }));
}

export async function generateMetadata({ params }: CountryPageProps): Promise<Metadata> {
  const { country: slug } = await params;
  const country = getCountry(slug);
  if (!country) return {};
  return pageMetadata({
    title: country.metaTitle,
    description: country.metaDescription,
    path: `/scam-prevention/${country.slug}`,
  });
}

export default async function CountryPage({ params }: CountryPageProps) {
  const { country: slug } = await params;
  const country = getCountry(slug);
  if (!country) notFound();

  const sources = country.sources.map((id) => requireSource(id));
  const guides = getAllGuides().slice(0, 4);

  return (
    <Container className="py-8 sm:py-10">
      <Breadcrumbs
        items={[
          { name: "Scam prevention by country", href: "/scam-prevention" },
          { name: country.name, href: `/scam-prevention/${country.slug}` },
        ]}
      />
      <div className="max-w-4xl">
        <header className="mb-8">
          <p className="eyebrow">{country.name}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
            {country.shortName} scam prevention: where to report and what to watch for
          </h1>
          <div className="mt-4 space-y-4 text-lg leading-relaxed text-navy-700">
            {country.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <p className="mt-4 text-sm text-navy-600">
            Reviewed {formatDate(SITE.lastReviewed)}. ScamSpotter is not a government service; follow the linked
            official sites for the latest guidance.
          </p>
        </header>

        <Callout tone="warning" title="If you've lost money or shared details">
          <ol className="mt-1 list-decimal space-y-1 pl-5">
            {country.firstSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </Callout>

        <section aria-labelledby="report-heading" className="mt-12">
          <h2 id="report-heading" className="text-2xl font-bold text-navy-950">
            Where to report a scam in {country.placeName}
          </h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {country.reporting.map((channel) => {
              const source = requireSource(channel.source);
              return (
                <li key={channel.name} className="card">
                  <h3 className="text-lg font-semibold text-navy-950">{channel.name}</h3>
                  <p className="mt-1 text-sm font-medium text-navy-700">For: {channel.useFor}</p>
                  <p className="mt-2 leading-relaxed text-navy-800">{channel.how}</p>
                  <a href={source.url} rel="noopener noreferrer" className="text-link mt-3 inline-flex items-center gap-1 text-sm">
                    {source.publisher}: {source.title}
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="never-heading" className="mt-12">
          <h2 id="never-heading" className="text-2xl font-bold text-navy-950">
            What official organisations say
          </h2>
          <p className="mt-2 text-navy-700">
            Knowing how genuine organisations behave is one of the best defences. These statements summarise the
            organisations&rsquo; own published guidance.
          </p>
          <ul className="mt-6 space-y-4">
            {country.officialStatements.map((item) => {
              const source = requireSource(item.source);
              return (
                <li key={item.statement} className="rounded-2xl border-l-4 border-brand-600 bg-navy-50 p-5">
                  <p className="font-semibold text-navy-950">{item.organisation}</p>
                  <p className="mt-1 leading-relaxed text-navy-800">{item.statement}</p>
                  <a href={source.url} rel="noopener noreferrer" className="text-link mt-2 inline-flex items-center gap-1 text-sm">
                    Source: {source.title}
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="scams-heading" className="mt-12">
          <h2 id="scams-heading" className="text-2xl font-bold text-navy-950">
            Scams to watch for in {country.placeName}
          </h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {country.scams.map((scam) => (
              <li key={scam.title} className="card">
                <h3 className="text-lg font-semibold text-navy-950">{scam.title}</h3>
                <p className="mt-2 leading-relaxed text-navy-800">{scam.description}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="example-heading" className="mt-12">
          <h2 id="example-heading" className="text-2xl font-bold text-navy-950">
            An example to practise on
          </h2>
          <p className="mt-2 text-navy-700">
            This illustrative message was written by ScamSpotter and uses a reserved &ldquo;.example&rdquo; address. It
            is not a copy of a real message.
          </p>
          <blockquote className="mt-4 rounded-2xl border border-navy-200 bg-white p-5 font-mono text-sm leading-relaxed break-words text-navy-900">
            {country.illustration.message}
          </blockquote>
          <p className="mt-4 leading-relaxed text-navy-800">
            <span className="font-semibold">Why it&rsquo;s suspicious: </span>
            {country.illustration.whyItsSuspicious}
          </p>
          <p className="mt-4">
            <Link href="/message-checker" className="btn-primary">
              Check a message
            </Link>
          </p>
        </section>

        <AdSlot placement="article" />

        <section aria-labelledby="tools-heading" className="mt-12">
          <h2 id="tools-heading" className="text-2xl font-bold text-navy-950">
            Free checkers
          </h2>
          <div className="mt-4">
            <ToolCards />
          </div>
        </section>

        <RelatedGuides guides={guides} title="Guides for spotting scams" />
        <SourceList sources={sources} />
      </div>
    </Container>
  );
}
