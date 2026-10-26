import type { Metadata } from "next";
import Link from "next/link";
import { IconPin } from "@/components/Icons";
import { PageHero } from "@/components/ui";
import { DISTRICTS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Tourist Vehicle Rental Locations in Tamil Nadu",
  description: "Find tourist vehicle operators by district across Tamil Nadu — Chennai, Coimbatore, Madurai, Salem, Trichy and more.",
  alternates: { canonical: "/locations/" },
};

export default function LocationsPage() {
  const approved = DISTRICTS.filter((d) => d.approvedPage);
  const others = DISTRICTS.filter((d) => !d.approvedPage);
  return (
    <>
      <PageHero
        crumbs={[{ href: "/", label: "Home" }, { label: "Locations" }]}
        eyebrow="Locations"
        title="Tourist Vehicles Across Tamil Nadu"
        sub="Explore district guides or search any Tamil Nadu district directly."
      />
      <section className="container-x py-12">
        <h2 className="h2 mb-6">District guides</h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {approved.map((d) => (
            <li key={d.id}>
              <Link href={`/locations/${d.id}/`} className="card card-hover block h-full p-5">
                <span className="flex items-center gap-2 text-lg font-bold text-navy"><IconPin size={18} className="text-orange" />{d.name}</span>
                <span className="mt-2 line-clamp-3 block text-sm text-muted">{d.intro}</span>
              </Link>
            </li>
          ))}
        </ul>
        <h2 className="h2 mb-4 mt-14">Search other districts</h2>
        <ul className="flex flex-wrap gap-2">
          {others.map((d) => (
            <li key={d.id}>
              <Link href={`/search/results/?district=${d.id}`} className="inline-block rounded-full border border-line bg-white px-3.5 py-1.5 text-sm hover:border-blue hover:text-blue" rel="nofollow">
                {d.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
