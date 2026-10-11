interface LogoMarkProps {
  className?: string;
}

/** ScamSpotter mark: a shield containing a magnifying glass. Decorative. */
export function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false" className={className}>
      <path d="M16 2.5 4.5 6.8v8.4c0 7.2 4.8 12.6 11.5 14.3 6.7-1.7 11.5-7.1 11.5-14.3V6.8L16 2.5Z" fill="#0f1d36" />
      <circle cx="14.5" cy="14.5" r="5.2" fill="none" stroke="#ffffff" strokeWidth="2.4" />
      <path d="m18.4 18.4 4.3 4.3" stroke="#3b74f2" strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <span className="flex items-center gap-2">
      <LogoMark className="h-8 w-8 shrink-0" />
      <span className="text-xl font-bold tracking-tight text-navy-900">
        Scam<span className="text-brand-600">Spotter</span>
      </span>
    </span>
  );
}
