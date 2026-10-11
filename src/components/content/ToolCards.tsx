import { ArrowRight, Briefcase, Globe, Mail, MessageSquareWarning, PhoneCall } from "lucide-react";
import Link from "next/link";
import { TOOLS, type ToolId } from "@/lib/site";

const ICONS: Record<ToolId, typeof Mail> = {
  message: MessageSquareWarning,
  email: Mail,
  job: Briefcase,
  website: Globe,
  phone: PhoneCall,
};

interface ToolCardsProps {
  exclude?: ToolId;
  headingLevel?: "h2" | "h3";
}

export function ToolCards({ exclude, headingLevel = "h3" }: ToolCardsProps) {
  const Heading = headingLevel;
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {TOOLS.filter((tool) => tool.id !== exclude).map((tool) => {
        const Icon = ICONS[tool.id];
        return (
          <li key={tool.id}>
            <Link
              href={tool.href}
              className="card group flex h-full flex-col transition-colors hover:border-brand-200 hover:bg-brand-50/40"
            >
              <Icon className="h-8 w-8 text-brand-600" aria-hidden="true" />
              <Heading className="mt-3 text-lg font-semibold text-navy-950 group-hover:text-brand-700">{tool.name}</Heading>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-navy-700">{tool.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
                Open the tool
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
