import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Guide } from "@/lib/content/guides";

interface RelatedGuidesProps {
  guides: Guide[];
  title?: string;
}

export function RelatedGuides({ guides, title = "Related guides" }: RelatedGuidesProps) {
  if (guides.length === 0) return null;
  return (
    <section aria-labelledby="related-guides-heading" className="mt-12">
      <h2 id="related-guides-heading" className="text-2xl font-bold text-navy-950">
        {title}
      </h2>
      <ul className="mt-4 grid gap-4 md:grid-cols-2">
        {guides.map((guide) => (
          <li key={guide.slug}>
            <Link
              href={`/guides/${guide.slug}`}
              className="card group block h-full transition-colors hover:border-brand-200 hover:bg-brand-50/40"
            >
              <p className="text-sm font-medium text-brand-700">{guide.category}</p>
              <p className="mt-1 text-lg font-semibold text-navy-950 group-hover:text-brand-700">{guide.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-navy-700">{guide.summary}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
                Read the guide
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
