import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}

export function PageHeader({ eyebrow, title, children }: PageHeaderProps) {
  return (
    <header className="mb-8">
      {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
      <h1 className="text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">{title}</h1>
      {children && <div className="mt-4 max-w-3xl text-lg leading-relaxed text-navy-700">{children}</div>}
    </header>
  );
}
