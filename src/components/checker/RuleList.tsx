import { TEXT_RULES, type CheckerKind, type Severity } from "@/lib/detection";
import { SEVERITY_WEIGHTS } from "@/lib/detection";

const SEVERITY_TEXT: Record<Severity, string> = {
  critical: "Critical",
  strong: "Strong",
  moderate: "Moderate",
  weak: "Weak",
};

/** Lists every text rule a checker uses, so the scoring is fully transparent. */
export function RuleList({ kind }: { kind: CheckerKind }) {
  const rules = TEXT_RULES.filter((rule) => rule.appliesTo.includes(kind));
  return (
    <details className="card group mt-4">
      <summary className="cursor-pointer text-base font-semibold text-brand-700 marker:text-brand-700">
        See all {rules.length} text rules this checker uses
      </summary>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[34rem] text-left text-sm">
          <caption className="sr-only">Rules, their severity and score weight</caption>
          <thead>
            <tr className="border-b border-navy-200 text-navy-700">
              <th scope="col" className="py-2 pr-4 font-semibold">
                Warning sign
              </th>
              <th scope="col" className="py-2 pr-4 font-semibold">
                Severity
              </th>
              <th scope="col" className="py-2 font-semibold">
                Weight
              </th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule) => (
              <tr key={rule.id} className="border-b border-navy-100 align-top">
                <td className="py-2 pr-4 text-navy-900">{rule.title}</td>
                <td className="py-2 pr-4 text-navy-700">{SEVERITY_TEXT[rule.severity]}</td>
                <td className="py-2 text-navy-700">+{SEVERITY_WEIGHTS[rule.severity]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-sm text-navy-700">
          Links in the text are also checked for lookalike domains, brand names on unrelated domains, raw IP addresses,
          shortened links and other structural warning signs.
        </p>
      </div>
    </details>
  );
}
