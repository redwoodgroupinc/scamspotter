import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/ads/AdSlot";
import { Markdown } from "@/components/content/Markdown";
import { RelatedGuides } from "@/components/content/RelatedGuides";
import { SourceList } from "@/components/content/SourceList";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { getAllGuides, getGuide } from "@/lib/content/guides";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl, SITE, TOOLS } from "@/lib/site";

interface GuidePageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllGuides().map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  return pageMetadata({
    title: guide.title,
    description: guide.description,
    path: `/guides/${guide.slug}`,
    type: "article",
    publishedTime: guide.published,
    modifiedTime: guide.updated,
  });
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const related = guide.relatedGuides.map((relatedSlug) => getGuide(relatedSlug)).filter((item) => item !== undefined);
  const tools = TOOLS.filter((tool) => guide.relatedTools.includes(tool.id));
  const url = absoluteUrl(`/guides/${guide.slug}`);

  return (
    <Container className="py-8 sm:py-10">
      <Breadcrumbs
        items={[
          { name: "Scam Prevention Guides", href: "/guides" },
          { name: guide.title, href: `/guides/${guide.slug}` },
        ]}
      />
      <article className="mx-auto max-w-3xl lg:mx-0">
        <header className="mb-8">
          <p className="eyebrow">{guide.category}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">{guide.title}</h1>
          <p className="mt-4 text-xl leading-relaxed text-navy-700">{guide.summary}</p>
          <p className="mt-4 text-sm text-navy-600">
            By the{" "}
            <Link href="/editorial-policy" className="text-link">
              ScamSpotter editorial team
            </Link>{" "}
            &middot; Published <time dateTime={guide.published}>{formatDate(guide.published)}</time>
            {guide.updated !== guide.published && (
              <>
                {" "}
                &middot; Updated <time dateTime={guide.updated}>{formatDate(guide.updated)}</time>
              </>
            )}{" "}
            &middot; {guide.readingMinutes} min read
          </p>
        </header>

        {guide.headings.length > 2 && (
          <nav aria-labelledby="toc-heading" className="mb-10 rounded-2xl border border-navy-100 bg-navy-50 p-5">
            <h2 id="toc-heading" className="text-base font-semibold text-navy-900">
              On this page
            </h2>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-navy-800">
              {guide.headings.map((heading) => (
                <li key={heading.id}>
                  <a href={`#${heading.id}`} className="hover:text-brand-700 hover:underline">
                    {heading.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <Markdown>{guide.body}</Markdown>

        {tools.length > 0 && (
          <aside aria-labelledby="try-tool-heading" className="mt-12 rounded-2xl border border-brand-200 bg-brand-50 p-6">
            <h2 id="try-tool-heading" className="text-xl font-bold text-navy-950">
              Check a suspicious message
            </h2>
            <p className="mt-2 text-navy-800">
              Paste it into one of our free checkers to see which warning signs it contains. The check runs in your
              browser and nothing is stored.
            </p>
            <ul className="mt-4 flex flex-wrap gap-3">
              {tools.map((tool) => (
                <li key={tool.id}>
                  <Link href={tool.href} className="btn-primary">
                    {tool.name}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}

        <AdSlot placement="article" />

        <SourceList sources={guide.sources} />
        <p className="mt-6 text-sm text-navy-600">
          This guide is general information, not legal or financial advice. Read our{" "}
          <Link href="/disclaimer" className="text-link">
            disclaimer
          </Link>{" "}
          and{" "}
          <Link href="/editorial-policy" className="text-link">
            editorial policy
          </Link>
          .
        </p>
        <RelatedGuides guides={related} />
      </article>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: guide.title,
          description: guide.description,
          datePublished: guide.published,
          dateModified: guide.updated,
          mainEntityOfPage: url,
          url,
          image: absoluteUrl("/opengraph-image"),
          inLanguage: "en",
          author: { "@type": "Organization", name: SITE.name, url: SITE.url },
          publisher: {
            "@type": "Organization",
            name: SITE.name,
            url: SITE.url,
            logo: { "@type": "ImageObject", url: absoluteUrl("/icon.svg") },
          },
        }}
      />
    </Container>
  );
}
