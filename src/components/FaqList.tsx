import type { FaqItem } from "@/lib/types";
import { IconChevronDown } from "./Icons";

/** Accessible accordion. FAQ schema is emitted only for the FAQs actually visible (spec §15). */
export function FaqList({ items, schema = true }: { items: FaqItem[]; schema?: boolean }) {
  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <div className="divide-y divide-line rounded-[var(--radius-card)] border border-line bg-white">
      {items.map((f) => (
        <details key={f.q} className="group px-5 py-1 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-semibold text-navy">
            {f.q}
            <IconChevronDown size={18} className="shrink-0 text-muted transition-transform group-open:rotate-180" />
          </summary>
          <p className="pb-5 leading-relaxed text-muted">{f.a}</p>
        </details>
      ))}
      {schema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />}
    </div>
  );
}
