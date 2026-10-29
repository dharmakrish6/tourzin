import type { Metadata } from "next";
import Link from "next/link";
import { FaqList } from "@/components/FaqList";
import { FeaturedOperators, PopularDistricts } from "@/components/home/HomeDynamic";
import {
  IconArrowRight,
  IconClipboard,
  IconCompare,
  IconHandshake,
  IconPhone,
  IconSearch,
  IconShield,
  IconStore,
  IconUsers,
} from "@/components/Icons";
import { SearchForm } from "@/components/SearchForm";
import { SectionHead } from "@/components/ui";
import { VEHICLE_CATEGORIES } from "@/lib/constants";
import { FAQS, GUIDES, DEFAULT_SITE_CONFIG } from "@/lib/data/content";

export const metadata: Metadata = {
  title: { absolute: "Tourzin — Find Tourist Vehicles in Tamil Nadu | Tempo Traveller, Urbania, Bus" },
  description:
    "Search and compare tourist vehicle operators across Tamil Nadu. Tempo Travellers, Urbanias, tourist coaches and buses — contact operators directly by call or WhatsApp.",
  alternates: { canonical: "/" },
};

const trust = [
  { icon: IconStore, title: "Specialized Tourist Vehicle Marketplace", text: "Built only for tourist vans, coaches and buses in Tamil Nadu." },
  { icon: IconShield, title: "Tourzin Verified Operators", text: "Look for the badge — shown only after formal verification." },
  { icon: IconHandshake, title: "Direct Customer-to-Operator Contact", text: "Call or WhatsApp operators directly. No middleman markup." },
  { icon: IconCompare, title: "Compare Multiple Options", text: "See several operators side by side before you decide." },
];

export default function HomePage() {
  const homeFaqs = FAQS.filter((f) => f.home).slice(0, 6);
  const guides = GUIDES.filter((g) => g.featured).slice(0, 3);

  return (
    <>
      {/* 1. Hero + Search */}
      <section className="relative overflow-hidden bg-navy">
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.12]" aria-hidden>
          <defs>
            <pattern id="route" width="120" height="120" patternUnits="userSpaceOnUse">
              <path d="M0 90 C 30 60, 60 110, 120 40" stroke="#fff" strokeWidth="1.5" fill="none" strokeDasharray="5 7" />
              <circle cx="120" cy="40" r="3" fill="#F47A20" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#route)" />
        </svg>
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue/40 blur-3xl" aria-hidden />
        <div className="container-x relative pb-12 pt-10 sm:pb-16 sm:pt-16 lg:pb-20">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">
            <span className="h-1.5 w-1.5 rounded-full bg-orange" /> Serving districts across Tamil Nadu
          </p>
          <h1 className="max-w-3xl text-[32px] font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[56px]">
            Find the Right Tourist Vehicle for Your Trip.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
            Discover Tempo Travellers, Urbanias, tourist coaches and buses from operators across Tamil Nadu. Compare options
            and contact operators directly.
          </p>
          <div className="mt-8 max-w-5xl">
            <SearchForm source="homepage" />
          </div>
          <p className="mt-4 text-sm text-white/75">
            Need help?{" "}
            <Link href="/let-tourzin-help/" className="font-semibold text-white underline decoration-orange decoration-2 underline-offset-4 hover:text-orange-50">
              Let Tourzin Help
            </Link>{" "}
            find the right vehicle for you.
          </p>
        </div>
      </section>

      {/* 2. Trust cards */}
      <section className="border-b border-line bg-soft">
        <div className="container-x grid grid-cols-1 gap-3 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {trust.map((t) => (
            <div key={t.title} className="flex items-start gap-3 rounded-xl bg-white p-4 ring-1 ring-line">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue">
                <t.icon size={20} />
              </span>
              <div>
                <h2 className="text-sm font-semibold leading-snug text-navy">{t.title}</h2>
                <p className="mt-0.5 text-xs leading-relaxed text-muted">{t.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Popular vehicle types */}
      <section className="container-x py-16">
        <SectionHead eyebrow="Vehicle types" title="Popular Vehicle Types" sub="Seating ranges are approximate — confirm the exact layout with the operator." />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {VEHICLE_CATEGORIES.map((c) => {
            const inner = (
              <>
                <div className="relative aspect-[16/10] overflow-hidden bg-soft">
                  <img src={c.photo ?? `/img/vehicles/${c.id}-1.svg`} alt={c.photo ? c.name : `${c.name} illustration`} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                  {!c.live && <span className="badge absolute left-3 top-3 bg-orange text-white">Coming soon</span>}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-bold text-navy">{c.name}</h3>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted">
                    <IconUsers size={15} /> {c.seatRange}
                  </p>
                  <p className="mt-2 line-clamp-3 text-sm text-muted">{c.blurb}</p>
                  {c.live && (
                    <span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-semibold text-blue">
                      Explore <IconArrowRight size={16} />
                    </span>
                  )}
                </div>
              </>
            );
            return (
              <li key={c.id}>
                {c.live ? (
                  <Link href={`/vehicles/${c.id}/`} className="card card-hover group flex h-full flex-col overflow-hidden">
                    {inner}
                  </Link>
                ) : (
                  <div className="card group flex h-full flex-col overflow-hidden opacity-90" aria-disabled>
                    {inner}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* 4. Popular districts */}
      <section className="bg-soft py-16">
        <div className="container-x">
          <SectionHead
            eyebrow="Locations"
            title="Popular Districts"
            action={<Link href="/locations/" className="btn btn-ghost btn-sm self-start">All locations <IconArrowRight size={16} /></Link>}
          />
          <PopularDistricts />
        </div>
      </section>

      {/* 5. Let Tourzin Help */}
      <section className="container-x py-16">
        <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr_1fr] lg:items-stretch">
          <div className="lg:pr-6">
            <p className="eyebrow mb-2">Assisted search</p>
            <h2 className="h2">Not sure what to book? Let Tourzin Help.</h2>
            <p className="mt-3 text-muted">
              Share your trip requirement and a Tourzin executive will look for suitable operators and share options with you.
              No login needed.
            </p>
          </div>
          <div className="card flex flex-col p-6">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-orange-50 text-orange"><IconClipboard /></span>
            <h3 className="h3 mt-4">Submit your trip details</h3>
            <p className="mt-1 flex-1 text-sm text-muted">District, destination, dates and group size — takes about a minute.</p>
            <Link href="/let-tourzin-help/" className="btn btn-primary mt-5">Submit Trip Details</Link>
          </div>
          <div className="card flex flex-col p-6">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue"><IconPhone /></span>
            <h3 className="h3 mt-4">Prefer to speak to us?</h3>
            <p className="mt-1 flex-1 text-sm text-muted">{DEFAULT_SITE_CONFIG.businessHours}</p>
            <a href={`tel:${DEFAULT_SITE_CONFIG.supportPhone.replace(/\s/g, "")}`} className="btn btn-secondary mt-5">Call Tourzin</a>
          </div>
        </div>
      </section>

      {/* 6. How Tourzin works */}
      <section className="bg-soft py-16">
        <div className="container-x">
          <SectionHead eyebrow="How it works" title="Two easy ways to find your vehicle" />
          <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <div className="card border-blue/30 p-6 ring-1 ring-blue/20 sm:p-8">
              <p className="badge bg-blue text-white">Most popular</p>
              <h3 className="mt-3 text-xl font-bold text-navy">Search &amp; contact operators yourself</h3>
              <ol className="mt-5 grid gap-4 sm:grid-cols-2">
                {[
                  ["Search vehicles", "Pick your district, vehicle type and group size."],
                  ["Browse operators", "Local operators first, then those serving your district."],
                  ["Compare", "Fleet size, photos and indicative prices."],
                  ["Call or WhatsApp", "Review the safety checklist, then contact directly."],
                ].map(([t, d], i) => (
                  <li key={t} className="flex gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy text-sm font-bold text-white">{i + 1}</span>
                    <span><span className="block font-semibold text-navy">{t}</span><span className="text-sm text-muted">{d}</span></span>
                  </li>
                ))}
              </ol>
              <Link href="/search/" className="btn btn-primary mt-6"><IconSearch size={18} /> Search Vehicles</Link>
            </div>
            <div className="card p-6 sm:p-8">
              <h3 className="text-xl font-bold text-navy">Let Tourzin Help</h3>
              <ol className="mt-5 space-y-4">
                {["Share your trip requirement", "We match suitable operators", "Get shortlisted options", "We connect you with your choice"].map((t, i) => (
                  <li key={t} className="flex gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-50 text-sm font-bold text-blue">{i + 1}</span>
                    <span className="pt-1 font-medium text-navy">{t}</span>
                  </li>
                ))}
              </ol>
              <Link href="/let-tourzin-help/" className="btn btn-secondary mt-6">Submit Trip Details</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Featured operators */}
      <section className="container-x py-16">
        <SectionHead eyebrow="Featured" title="Featured Operators" sub="Verified operators selected by the Tourzin team." />
        <FeaturedOperators />
      </section>

      {/* 8. FAQ */}
      <section className="bg-soft py-16">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <p className="eyebrow mb-2">FAQ</p>
            <h2 className="h2">Frequently asked questions</h2>
            <p className="mt-3 text-muted">Quick answers about searching, contacting operators and pricing.</p>
            <Link href="/faq/" className="btn btn-secondary btn-sm mt-5">View all FAQs</Link>
          </div>
          <FaqList items={homeFaqs} />
        </div>
      </section>

      {/* 9. Guides */}
      <section className="container-x py-16">
        <SectionHead
          eyebrow="Guides"
          title="Plan your trip better"
          action={<Link href="/guides/" className="btn btn-ghost btn-sm self-start">All guides <IconArrowRight size={16} /></Link>}
        />
        <div className="grid gap-5 md:grid-cols-3">
          {guides.map((g) => (
            <Link key={g.slug} href={`/guides/${g.slug}/`} className="card card-hover flex flex-col p-6">
              <p className="eyebrow">{g.category}</p>
              <h3 className="mt-2 text-lg font-bold leading-snug text-navy">{g.title}</h3>
              <p className="mt-2 flex-1 text-sm text-muted">{g.excerpt}</p>
              <p className="mt-4 text-xs text-muted">{g.readMins} min read</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
