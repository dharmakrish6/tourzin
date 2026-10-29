import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaqList } from "@/components/FaqList";
import { IconCheckCircle, IconSearch, IconUsers } from "@/components/Icons";
import { TrackedLink } from "@/components/TrackedLink";
import { Breadcrumbs } from "@/components/ui";
import { DISTRICTS, VEHICLE_CATEGORIES, categoryById } from "@/lib/constants";
import { GUIDES } from "@/lib/data/seed";
import type { FaqItem } from "@/lib/types";

export const dynamicParams = false;
export function generateStaticParams() {
  return VEHICLE_CATEGORIES.map((c) => ({ slug: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = categoryById((await params).slug);
  if (!c) return {};
  return {
    title: `${c.name} Rental in Tamil Nadu`,
    description: `Find ${c.name} operators across Tamil Nadu. ${c.seatRange.replace("Approx.", "Approximately")}, ideal for ${c.useCases.slice(0, 2).join(" and ").toLowerCase()}. Compare and contact operators directly.`,
    alternates: { canonical: `/vehicles/${c.id}/` },
    // Mini Bus is APPROVED/PLANNED — index only after launch
    robots: c.live ? undefined : { index: false, follow: true },
  };
}

const faqsFor = (name: string, seat: string): FaqItem[] => [
  { group: "", q: `How many people can a ${name} carry?`, a: `${seat.replace("Approx.", "Most are approximately")}, but layouts vary by model and operator. Always confirm the exact seat count with the operator before booking.` },
  { group: "", q: `How much does a ${name} cost per day?`, a: `Prices depend on distance, days, season and inclusions. Some operators on Tourzin share an approximate daily price as a guide — the final quote always comes from the operator.` },
  { group: "", q: `Can I book a ${name} directly on Tourzin?`, a: `Tourzin helps you find and contact operators. You confirm the quote, availability, booking and payment directly with the operator.` },
];

export default async function VehiclePage({ params }: { params: Promise<{ slug: string }> }) {
  const c = categoryById((await params).slug);
  if (!c) notFound();
  const districts = DISTRICTS.filter((d) => d.approvedPage).slice(0, 8);
  const related = GUIDES.filter((g) => g.category === "Vehicle Guides" || g.category === "Pricing Guides").slice(0, 3);
  const others = VEHICLE_CATEGORIES.filter((x) => x.id !== c.id && x.live);

  return (
    <>
      <section className="border-b border-line bg-soft">
        <div className="container-x grid items-center gap-8 py-10 sm:py-14 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Vehicles" }, { label: c.name }]} />
            {!c.live && <p className="badge mb-3 bg-orange text-white">Coming soon</p>}
            <h1 className="h1">{c.name} Rental in Tamil Nadu</h1>
            <p className="lead mt-4">{c.blurb}</p>
            <p className="mt-4 flex items-center gap-2 font-semibold text-navy"><IconUsers size={18} /> {c.seatRange}</p>
            {c.live ? (
              <TrackedLink href={`/search/?type=${c.id}`} event="vehicle_category_cta_clicked" props={{ vehicle_type: c.id }} className="btn btn-primary mt-6">
                <IconSearch size={18} /> Search {c.name}
              </TrackedLink>
            ) : (
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/let-tourzin-help/?type=mini-bus" className="btn btn-primary">Let Tourzin Help</Link>
                <Link href="/for-operators/#join" className="btn btn-secondary">List your Mini Bus</Link>
              </div>
            )}
          </div>
          <img src={c.photo ?? `/img/vehicles/${c.id}-2.svg`} alt={c.photo ? c.name : `${c.name} illustration`} className="w-full rounded-2xl border border-line" />
        </div>
      </section>

      <div className="container-x grid gap-12 py-12 lg:grid-cols-[2fr_1fr]">
        <article className="prose-tz">
          <h2>{c.name} overview</h2>
          <p>
            A {c.name.toLowerCase()} is a popular choice for group travel in Tamil Nadu. {c.blurb} Operators on Tourzin list their
            vehicles with photos so you can compare before you call.
          </p>
          <h2>Seating guidance</h2>
          <p>
            {c.seatRange.replace("Approx.", "Most")} are typical, but this is display guidance only — configurations differ between
            models and operators. Count your group including children, and allow space for luggage on multi-day trips.
          </p>
          <h2>Popular uses</h2>
          <ul>{c.useCases.map((u) => <li key={u}>{u}</li>)}</ul>
          <h2>What to confirm before booking</h2>
          <ul>
            {["Exact vehicle and seat count", "Final quote and what's included", "Toll, parking, permit and driver charges", "Payment and cancellation terms", "Written confirmation of the booking"].map((t) => <li key={t}>{t}</li>)}
          </ul>
          <h2>Frequently asked questions</h2>
          <div className="not-prose">
            <FaqList items={faqsFor(c.name, c.seatRange)} schema={c.live} />
          </div>
        </article>

        <aside className="space-y-6">
          {c.live && (
            <div className="card p-6">
              <h2 className="h3">Popular districts</h2>
              <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
                {districts.map((d) => (
                  <li key={d.id}>
                    <Link href={`/locations/${d.id}/`} className="text-blue hover:underline">{c.shortName} in {d.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="card p-6">
            <h2 className="h3">Other vehicle types</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {others.map((o) => <li key={o.id}><Link href={`/vehicles/${o.id}/`} className="text-blue hover:underline">{o.name}</Link> <span className="text-muted">· {o.seatRange}</span></li>)}
            </ul>
          </div>
          <div className="card p-6">
            <h2 className="h3">Related guides</h2>
            <ul className="mt-3 space-y-3 text-sm">
              {related.map((g) => <li key={g.slug} className="flex gap-2"><IconCheckCircle size={16} className="mt-0.5 shrink-0 text-blue" /><Link href={`/guides/${g.slug}/`} className="hover:text-blue hover:underline">{g.title}</Link></li>)}
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
