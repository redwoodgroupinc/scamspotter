import type { Metadata } from "next";
import Link from "next/link";
import { NarrowContainer } from "@/components/ui/Container";
import { TOOLS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <NarrowContainer className="py-16">
      <h1 className="text-3xl font-bold text-navy-950">Page not found</h1>
      <p className="mt-4 text-lg text-navy-700">
        We couldn&rsquo;t find that page. If you followed a link from a message you weren&rsquo;t expecting, be careful:
        scammers sometimes send links to pages that don&rsquo;t exist.
      </p>
      <h2 className="mt-8 text-xl font-semibold text-navy-950">Try one of our free tools</h2>
      <ul className="mt-3 list-disc space-y-1 pl-6">
        {TOOLS.map((tool) => (
          <li key={tool.href}>
            <Link href={tool.href} className="text-link">
              {tool.name}
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-8">
        <Link href="/" className="btn-primary">
          Go to the homepage
        </Link>
      </p>
    </NarrowContainer>
  );
}
