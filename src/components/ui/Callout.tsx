import { AlertTriangle, Info, Lock } from "lucide-react";
import type { ReactNode } from "react";

type Tone = "info" | "warning" | "privacy";

const STYLES: Record<Tone, string> = {
  info: "border-brand-200 bg-brand-50 text-navy-900",
  warning: "border-red-200 bg-red-50 text-navy-900",
  privacy: "border-navy-200 bg-navy-50 text-navy-900",
};

const ICONS = { info: Info, warning: AlertTriangle, privacy: Lock };
const ICON_COLORS: Record<Tone, string> = {
  info: "text-brand-700",
  warning: "text-red-700",
  privacy: "text-navy-700",
};

interface CalloutProps {
  tone?: Tone;
  title?: string;
  children: ReactNode;
  className?: string;
  id?: string;
}

export function Callout({ tone = "info", title, children, className = "", id }: CalloutProps) {
  const Icon = ICONS[tone];
  return (
    <div id={id} className={`flex gap-3 rounded-xl border p-4 ${STYLES[tone]} ${className}`}>
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${ICON_COLORS[tone]}`} aria-hidden="true" />
      <div className="text-sm leading-relaxed sm:text-[0.95rem]">
        {title && <p className="mb-1 font-semibold">{title}</p>}
        {children}
      </div>
    </div>
  );
}
