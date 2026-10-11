import type { ReactNode } from "react";
import { AdSlot } from "@/components/ads/AdSlot";
import { RelatedGuides } from "@/components/content/RelatedGuides";
import { ReportingOptions } from "@/components/content/ReportingOptions";
import { ToolCards } from "@/components/content/ToolCards";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { getGuidesForTool } from "@/lib/content/guides";
import { TOOLS, type ToolId } from "@/lib/site";

interface ToolPageLayoutProps {
  toolId: ToolId;
  heading: string;
  intro: ReactNode;
  checker: ReactNode;
  /** Explanation of how the tool works and what it can't do. Rendered right after the tool. */
  howItWorks: ReactNode;
  /** Further educational content. */
  children?: ReactNode;
}

export function ToolPageLayout({ toolId, heading, intro, checker, howItWorks, children }: ToolPageLayoutProps) {
  const tool = TOOLS.find((item) => item.id === toolId)!;
  const guides = getGuidesForTool(toolId).slice(0, 4);
  return (
    <Container className="py-8 sm:py-10">
      <Breadcrumbs items={[{ name: tool.name, href: tool.href }]} />
      <div className="max-w-4xl">
        <PageHeader eyebrow="Free tool" title={heading}>
          {intro}
        </PageHeader>
        {checker}
        <section aria-labelledby="how-heading" className="mt-14">
          <h2 id="how-heading" className="text-2xl font-bold text-navy-950">
            How this checker works
          </h2>
          <div className="mt-4 space-y-4 text-lg leading-relaxed text-navy-800">{howItWorks}</div>
        </section>
        {children && <div className="mt-12 space-y-12">{children}</div>}
        <ReportingOptions />
        <AdSlot placement="tool" />
        <RelatedGuides guides={guides} />
        <section aria-labelledby="other-tools-heading" className="mt-12">
          <h2 id="other-tools-heading" className="text-2xl font-bold text-navy-950">
            Other free checkers
          </h2>
          <div className="mt-4">
            <ToolCards exclude={toolId} />
          </div>
        </section>
      </div>
    </Container>
  );
}

export function ContentSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="text-2xl font-bold text-navy-950">
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-lg leading-relaxed text-navy-800 [&_li]:leading-relaxed [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
        {children}
      </div>
    </section>
  );
}
