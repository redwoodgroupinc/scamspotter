import { ExternalLink } from "lucide-react";
import { SOURCES_LAST_VERIFIED, type Source } from "@/data/sources";
import { formatDate } from "@/lib/format";

export function SourceList({ sources, heading = "Sources" }: { sources: Source[]; heading?: string }) {
  if (sources.length === 0) return null;
  return (
    <section aria-labelledby="sources-heading" className="mt-12 border-t border-navy-100 pt-8">
      <h2 id="sources-heading" className="text-xl font-bold text-navy-950">
        {heading}
      </h2>
      <p className="mt-1 text-sm text-navy-600">
        Official and established sources, checked on {formatDate(SOURCES_LAST_VERIFIED)}. Organisations update their
        advice, so follow the latest guidance on their sites.
      </p>
      <ul className="mt-4 space-y-3">
        {sources.map((source) => (
          <li key={source.id} className="text-sm leading-relaxed">
            <a href={source.url} rel="noopener noreferrer" className="text-link inline-flex items-start gap-1">
              {source.title}
              <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            </a>
            <span className="text-navy-600"> &mdash; {source.publisher}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
