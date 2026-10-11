import Link from "next/link";
import { LEGAL_NAV, PRIMARY_NAV, TOOLS } from "@/lib/site";
import { Wordmark } from "./Logo";
import { MobileNav } from "./MobileNav";

export function SiteHeader() {
  const phone = TOOLS.find((tool) => tool.id === "phone");
  const secondary = [...(phone ? [{ href: phone.href, label: phone.name }] : []), ...LEGAL_NAV];

  return (
    <header className="relative border-b border-navy-100 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="rounded-md" aria-label="ScamSpotter home">
          <Wordmark />
        </Link>
        <nav aria-label="Main" className="hidden xl:block">
          <ul className="flex items-center gap-1">
            {PRIMARY_NAV.filter((link) => link.href !== "/").map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-md px-2.5 py-2 text-[0.94rem] font-medium text-navy-800 hover:bg-navy-50 hover:text-brand-700"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <MobileNav primary={PRIMARY_NAV} secondary={secondary} />
      </div>
    </header>
  );
}
