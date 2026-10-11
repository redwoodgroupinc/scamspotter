import { ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { COUNTRIES } from "@/data/countries";
import { requireSource } from "@/data/sources";

interface ReportingOptionsProps {
  headingLevel?: "h2" | "h3";
  title?: string;
}

/** Key official reporting routes for all four supported countries. */
export function ReportingOptions({ headingLevel = "h2", title = "Where to report a scam" }: ReportingOptionsProps) {
  const Heading = headingLevel;
  const SubHeading = headingLevel === "h2" ? "h3" : "h4";
  return (
    <section aria-labelledby="reporting-heading" className="mt-12">
      <Heading id="reporting-heading" className="text-2xl font-bold text-navy-950">
        {title}
      </Heading>
      <p className="mt-2 max-w-3xl text-navy-700">
        Reporting helps authorities warn others and disrupt scams, even if you didn&rsquo;t lose money. These are the
        main official routes in each country we cover.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {COUNTRIES.map((country) => (
          <div key={country.code} className="card flex flex-col">
            <SubHeading className="text-lg font-semibold text-navy-950">{country.name}</SubHeading>
            <ul className="mt-3 flex-1 space-y-3 text-sm">
              {country.reporting.slice(0, 3).map((channel) => {
                const source = requireSource(channel.source);
                return (
                  <li key={channel.name}>
                    <a href={source.url} rel="noopener noreferrer" className="text-link inline-flex items-start gap-1">
                      {channel.name}
                      <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    </a>
                    <p className="mt-0.5 text-navy-700">{channel.how}</p>
                  </li>
                );
              })}
            </ul>
            <Link href={`/scam-prevention/${country.slug}`} className="btn-quiet mt-4 self-start">
              All {country.shortName} options
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
