import type { Metadata } from "next";
import { FaqList } from "@/components/FaqList";
import { PageHero } from "@/components/ui";
import { FAQS } from "@/lib/data/seed";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Answers about searching for tourist vehicles, contacting operators, pricing, Tourzin Verified and listing your vehicles.",
  alternates: { canonical: "/faq/" },
};

const ORDER = ["Using Tourzin", "Vehicle Search", "Operator Contact", "Pricing", "Tourzin Verified", "Let Tourzin Help", "For Operators", "Subscription/Joining"];

export default function FaqPage() {
  const groups = ORDER.map((g) => ({ g, items: FAQS.filter((f) => f.group === g) })).filter((x) => x.items.length);
  return (
    <>
      <PageHero crumbs={[{ href: "/", label: "Home" }, { label: "FAQ" }]} eyebrow="Help centre" title="Frequently Asked Questions" />
      <section className="container-x grid gap-10 py-12 lg:grid-cols-[220px_1fr]">
        <nav aria-label="FAQ sections" className="hidden lg:block">
          <ul className="sticky top-28 space-y-1 text-sm">
            {groups.map(({ g }) => (
              <li key={g}><a href={`#${g.replace(/\W+/g, "-").toLowerCase()}`} className="block rounded-lg px-3 py-2 text-muted hover:bg-soft hover:text-navy">{g.replace("/", " / ")}</a></li>
            ))}
          </ul>
        </nav>
        <div className="space-y-10">
          {groups.map(({ g, items }) => (
            <div key={g} id={g.replace(/\W+/g, "-").toLowerCase()} className="scroll-mt-28">
              <h2 className="h3 mb-3">{g.replace("/", " / ")}</h2>
              <FaqList items={items} schema={false} />
            </div>
          ))}
          <FaqSchema />
        </div>
      </section>
    </>
  );
}

function FaqSchema() {
  const ld = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />;
}
