import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { formatDate } from "@/lib/format";
import { Container } from "./Container";
import { PageHeader } from "./PageHeader";

interface ProsePageProps {
  title: string;
  path: string;
  intro?: ReactNode;
  updated?: string;
  children: ReactNode;
}

/** Layout for text-heavy pages (policies, about, editorial). */
export function ProsePage({ title, path, intro, updated, children }: ProsePageProps) {
  return (
    <Container className="py-8 sm:py-10">
      <Breadcrumbs items={[{ name: title, href: path }]} />
      <div className="max-w-3xl">
        <PageHeader title={title}>{intro}</PageHeader>
        {updated && (
          <p className="-mt-4 mb-8 text-sm text-navy-600">
            Last updated <time dateTime={updated}>{formatDate(updated)}</time>
          </p>
        )}
        <div className="prose prose-lg max-w-none prose-slate prose-headings:scroll-mt-24 prose-headings:text-navy-950 prose-a:text-brand-700 prose-a:decoration-brand-200 prose-a:underline-offset-4 prose-a:wrap-break-word prose-code:wrap-anywhere prose-strong:text-navy-950">
          {children}
        </div>
      </div>
    </Container>
  );
}
