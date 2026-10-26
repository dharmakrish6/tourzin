import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui";
import { GUIDES } from "@/lib/data/seed";

export const metadata: Metadata = {
  title: "Travel Guides — Tourist Vehicles in Tamil Nadu",
  description: "Guides on choosing tourist vehicles, understanding rental prices and planning group trips across Tamil Nadu.",
  alternates: { canonical: "/guides/" },
};

const CATS = ["Vehicle Guides", "Pricing Guides", "Group Travel Planning", "District/Local Guides", "Operator/Marketplace Guides"];

export default function GuidesPage() {
  return (
    <>
      <PageHero crumbs={[{ href: "/", label: "Home" }, { label: "Guides" }]} eyebrow="Guides" title="Guides for planning group travel" />
      <section className="container-x space-y-12 py-12">
        {CATS.map((c) => {
          const list = GUIDES.filter((g) => g.category === c);
          if (!list.length) return null;
          return (
            <div key={c}>
              <h2 className="h2 mb-5">{c.replace("/", " / ")}</h2>
              <div className="grid gap-5 md:grid-cols-3">
                {list.map((g) => (
                  <Link key={g.slug} href={`/guides/${g.slug}/`} className="card card-hover flex flex-col p-6">
                    <h3 className="text-lg font-bold leading-snug text-navy">{g.title}</h3>
                    <p className="mt-2 flex-1 text-sm text-muted">{g.excerpt}</p>
                    <p className="mt-4 text-xs text-muted">{g.readMins} min read</p>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </>
  );
}
