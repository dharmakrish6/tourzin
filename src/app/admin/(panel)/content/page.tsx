"use client";
import Link from "next/link";
import { Pill } from "@/components/staff/kit";
import { PageTitle } from "@/components/staff/StaffShell";
import { DISTRICTS, VEHICLE_CATEGORIES } from "@/lib/constants";
import { FAQS, GUIDES } from "@/lib/data/content";

const rows: [string, string, "Index" | "Noindex" | "Private", string][] = [
  ["/", "Home", "Index", "Core"],
  ["/search/", "Search Vehicles", "Index", "Core"],
  ["/search/results/", "Search Results (parameterised)", "Noindex", "Core"],
  ["/let-tourzin-help/", "Let Tourzin Help", "Index", "Core"],
  ["/for-operators/", "For Operators / Join", "Index", "Supply"],
  ["/about/", "About", "Index", "Company"],
  ["/contact/", "Contact", "Index", "Company"],
  ["/faq/", "FAQ", "Index", "Content"],
  ["/guides/", "Guides hub", "Index", "Content"],
  ["/locations/", "Locations hub", "Index", "Local SEO"],
  ...VEHICLE_CATEGORIES.map((c) => [`/vehicles/${c.id}/`, `${c.name} category`, c.live ? "Index" : "Noindex", c.live ? "Vehicle SEO" : "Planned — index after launch"] as [string, string, "Index" | "Noindex", string]),
  ...DISTRICTS.filter((d) => d.approvedPage).map((d) => [`/locations/${d.id}/`, `${d.name} district`, "Index", "Approved district"] as [string, string, "Index", string]),
  ...GUIDES.map((g) => [`/guides/${g.slug}/`, g.title, "Index", g.category] as [string, string, "Index", string]),
  ["/privacy/ /terms/ /marketplace-disclaimer/", "Legal", "Index", "Legal"],
  ["/admin/ /executive/", "Internal dashboards", "Private", "Disallowed in robots.txt"],
];

export default function ContentPage() {
  return (
    <>
      <PageTitle title="Content / SEO" sub="Indexable pages, metadata status and content inventory" actions={<a href="/sitemap.xml" target="_blank" className="btn btn-secondary btn-sm">View sitemap.xml</a>} />
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="card p-4 text-sm"><p className="text-2xl font-bold text-navy">{rows.filter((r) => r[2] === "Index").length}</p>indexable page groups</div>
        <div className="card p-4 text-sm"><p className="text-2xl font-bold text-navy">{FAQS.length}</p>FAQs ({FAQS.filter((f) => f.home).length} on homepage)</div>
        <div className="card p-4 text-sm"><p className="text-2xl font-bold text-navy">{GUIDES.length}</p>guides ({GUIDES.filter((g) => g.featured).length} featured)</div>
      </div>
      <div className="card overflow-x-auto">
        <table className="tbl min-w-[760px]">
          <thead><tr><th>URL</th><th>Page</th><th>Indexing</th><th>Type</th></tr></thead>
          <tbody>
            {rows.map(([u, t, i, k]) => (
              <tr key={u}>
                <td className="font-mono text-xs">{u.includes(" ") ? u : <Link href={u} target="_blank" className="text-blue hover:underline">{u}</Link>}</td>
                <td>{t}</td>
                <td><Pill tone={i === "Index" ? "green" : i === "Private" ? "red" : "orange"}>{i}</Pill></td>
                <td className="text-muted">{k}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted">In this MVP build, FAQ, guide and district copy live in <code>src/lib/data/content.ts</code> and <code>src/lib/constants.ts</code>. Each indexable page sets a unique title, meta description and self-referencing canonical; filter URLs are noindex.</p>
    </>
  );
}
