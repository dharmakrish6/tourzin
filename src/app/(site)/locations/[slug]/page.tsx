import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DistrictSupply } from "@/components/DistrictSupply";
import { IconCheckCircle, IconSearch } from "@/components/Icons";
import { TrackedLink } from "@/components/TrackedLink";
import { Breadcrumbs } from "@/components/ui";
import { DISTRICTS, districtById } from "@/lib/constants";

// Only manually approved districts get a page (no thin district pages).
export const dynamicParams = false;
export function generateStaticParams() {
  return DISTRICTS.filter((d) => d.approvedPage).map((d) => ({ slug: d.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const d = districtById((await params).slug);
  if (!d) return {};
  return {
    title: `Tourist Vehicle Rental in ${d.name} — Tempo Traveller, Urbania & Bus`,
    description: `Find tourist vehicle operators in ${d.name}, Tamil Nadu. Compare Tempo Travellers, Urbanias and tourist buses and contact operators directly.`,
    alternates: { canonical: `/locations/${d.id}/` },
  };
}

export default async function DistrictPage({ params }: { params: Promise<{ slug: string }> }) {
  const d = districtById((await params).slug);
  if (!d || !d.approvedPage) notFound();
  return (
    <>
      <section className="border-b border-line bg-soft">
        <div className="container-x py-10 sm:py-14">
          <Breadcrumbs items={[{ href: "/", label: "Home" }, { href: "/locations/", label: "Locations" }, { label: d.name }]} />
          <h1 className="h1 max-w-3xl">Tourist Vehicle Rental in {d.name}</h1>
          <p className="lead mt-4 max-w-2xl">{d.intro}</p>
          <TrackedLink href={`/search/?district=${d.id}`} event="district_cta_clicked" props={{ district: d.id }} className="btn btn-primary mt-6">
            <IconSearch size={18} /> Search Vehicles in {d.name}
          </TrackedLink>
        </div>
      </section>
      <div className="container-x grid gap-12 py-12 lg:grid-cols-[2fr_1fr]">
        <div>
          <h2 className="h2 mb-5">Vehicles available in {d.name}</h2>
          <DistrictSupply district={d.id} districtName={d.name} />
          <h2 className="h2 mb-4 mt-12">Popular trips from {d.name}</h2>
          <ul className="space-y-3">
            {d.highlights?.map((h) => (
              <li key={h} className="flex gap-3"><IconCheckCircle size={20} className="shrink-0 text-blue" />{h}</li>
            ))}
          </ul>
          <h2 className="h2 mb-3 mt-12">Booking tips</h2>
          <p className="text-ink/90 leading-relaxed">
            Contact two or three operators, confirm the exact vehicle and final quote in writing, and check whether toll, parking,
            permits and driver charges are included. Prices shown on operator cards are indicative and operator-provided.
          </p>
        </div>
        <aside className="card h-fit p-6">
          <h2 className="h3">Need help planning?</h2>
          <p className="mt-1 text-sm text-muted">Share your trip details and we&apos;ll find suitable operators in {d.name}.</p>
          <TrackedLink href={`/let-tourzin-help/?district=${d.id}`} event="district_cta_clicked" props={{ district: d.id, cta: "help" }} className="btn btn-secondary mt-4 w-full">
            Let Tourzin Help
          </TrackedLink>
        </aside>
      </div>
    </>
  );
}
