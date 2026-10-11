"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { NavLink } from "@/lib/site";

interface MobileNavProps {
  primary: NavLink[];
  secondary: NavLink[];
}

export function MobileNav({ primary, secondary }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const pathname = usePathname();
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close the menu after navigating to another page.
  const isOpen = open && openedAt === pathname;

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  return (
    <div className="xl:hidden">
      <button
        ref={buttonRef}
        type="button"
        className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg border border-navy-200 px-3 text-sm font-semibold text-navy-800 hover:bg-navy-50"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => {
          setOpen(!isOpen);
          setOpenedAt(pathname);
        }}
      >
        {isOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        <span>Menu</span>
      </button>
      <nav
        id={menuId}
        aria-label="Mobile"
        hidden={!isOpen}
        className="absolute inset-x-0 top-full z-40 max-h-[calc(100vh-4.5rem)] overflow-y-auto border-b border-navy-100 bg-white px-4 pt-2 pb-6 shadow-lg"
      >
        <ul className="divide-y divide-navy-100">
          {primary.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="block py-3 text-base font-medium text-navy-900 hover:text-brand-700"
                aria-current={pathname === link.href ? "page" : undefined}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {secondary.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="text-link">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
