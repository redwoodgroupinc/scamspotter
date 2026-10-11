import Link from "next/link";
import { COUNTRY_NAV, LEGAL_NAV, SITE, TOOLS } from "@/lib/site";
import { Wordmark } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-navy-100 bg-navy-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block rounded-md" aria-label="ScamSpotter home">
              <Wordmark />
            </Link>
            <p className="mt-3 font-semibold text-navy-800">{SITE.tagline}</p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-navy-700">
              ScamSpotter is a free educational resource. Our checkers look for common warning signs using
              transparent, local rules. They can&rsquo;t prove that anything is safe or a scam. If you&rsquo;ve lost
              money or shared personal details, contact your bank and the official reporting service in your country.
            </p>
          </div>
          <nav aria-label="Tools">
            <h2 className="text-sm font-semibold tracking-wide text-navy-900 uppercase">Free tools</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {TOOLS.map((tool) => (
                <li key={tool.href}>
                  <Link href={tool.href} className="text-navy-700 hover:text-brand-700 hover:underline">
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Guides by country">
            <h2 className="text-sm font-semibold tracking-wide text-navy-900 uppercase">Learn</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/guides" className="text-navy-700 hover:text-brand-700 hover:underline">
                  Scam Prevention Guides
                </Link>
              </li>
              {COUNTRY_NAV.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-navy-700 hover:text-brand-700 hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="About and policies">
            <h2 className="text-sm font-semibold tracking-wide text-navy-900 uppercase">ScamSpotter</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-navy-700 hover:text-brand-700 hover:underline">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-navy-700 hover:text-brand-700 hover:underline">
                  Contact
                </Link>
              </li>
              {LEGAL_NAV.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-navy-700 hover:text-brand-700 hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="mt-10 border-t border-navy-200 pt-6 text-xs text-navy-600">
          &copy; {new Date().getFullYear()} {SITE.domain}. Not affiliated with any government agency, bank or company
          mentioned on this site. Organisation names are used only to describe how scammers impersonate them.
        </p>
      </div>
    </footer>
  );
}
