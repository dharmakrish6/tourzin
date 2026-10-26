import Link from "next/link";
import { DISTRICTS, VEHICLE_CATEGORIES } from "@/lib/constants";
import { seedSiteConfig } from "@/lib/data/seed";
import { Logo } from "./Logo";

const cols: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Vehicles",
    links: VEHICLE_CATEGORIES.map((c) => ({ href: `/vehicles/${c.id}/`, label: c.name + (c.live ? "" : " (soon)") })),
  },
  {
    title: "Locations",
    links: [
      ...DISTRICTS.filter((d) => d.approvedPage).slice(0, 6).map((d) => ({ href: `/locations/${d.id}/`, label: d.name })),
      { href: "/locations/", label: "All locations" },
    ],
  },
  {
    title: "Customers",
    links: [
      { href: "/search/", label: "Search Vehicles" },
      { href: "/let-tourzin-help/", label: "Let Tourzin Help" },
      { href: "/faq/", label: "FAQ" },
      { href: "/guides/", label: "Guides" },
    ],
  },
  {
    title: "For Operators",
    links: [
      { href: "/for-operators/#join", label: "Join Tourzin" },
      { href: "/for-operators/#join", label: "List Your Vehicle" },
      { href: "/for-operators/#benefits", label: "Operator Benefits" },
      { href: "/for-operators/#verification", label: "Verification" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about/", label: "About" },
      { href: "/contact/", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy/", label: "Privacy Policy" },
      { href: "/terms/", label: "Terms & Conditions" },
      { href: "/marketplace-disclaimer/", label: "Marketplace Disclaimer" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-navy text-white/80">
      <div className="container-x grid gap-10 py-14 lg:grid-cols-[1.3fr_4fr]">
        <div className="space-y-4">
          <Logo light />
          <p className="max-w-xs text-sm leading-relaxed text-white/70">
            Tamil Nadu&apos;s marketplace for tourist vehicles. Discover, compare and contact operators directly.
          </p>
          <p className="text-sm text-white/70">
            {seedSiteConfig.supportPhone}
            <br />
            {seedSiteConfig.supportEmail}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
          {cols.map((c) => (
            <div key={c.title}>
              <h2 className="mb-3 text-sm font-semibold text-white">{c.title}</h2>
              <ul className="space-y-2 text-sm">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="hover:text-white hover:underline">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-2 py-5 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Tourzin. Serving Tamil Nadu.</p>
          <p>
            Tourzin is a discovery marketplace. Final quotes, bookings and payments are agreed directly with operators.
          </p>
        </div>
      </div>
    </footer>
  );
}
