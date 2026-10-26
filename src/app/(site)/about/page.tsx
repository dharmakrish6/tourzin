import type { Metadata } from "next";
import Link from "next/link";
import { IconShield } from "@/components/Icons";
import { PageHero } from "@/components/ui";

export const metadata: Metadata = {
  title: "About Tourzin",
  description: "Tourzin is a Tamil Nadu tourist-vehicle marketplace connecting customers with Tempo Traveller, Urbania, coach and bus operators.",
  alternates: { canonical: "/about/" },
};

export default function AboutPage() {
  const blocks = [
    ["What Tourzin is", "Tourzin is a marketplace focused on tourist vehicles in Tamil Nadu — Tempo Travellers, Urbanias, tourist coaches and tourist buses. We help customers discover and compare operators, and help operators reach customers planning group trips."],
    ["The problem we solve", "Finding a reliable tourist vehicle often means asking around, calling numbers from old posters, and comparing options with little information. Operators, meanwhile, depend on word of mouth. Tourzin brings both sides together in one place."],
    ["How Tourzin works", "Customers search by district, browse operators, compare and contact them directly by call or WhatsApp. If they need help, they can share their trip requirement and a Tourzin executive will find suitable options."],
    ["Value for customers", "A focused place to compare tourist vehicle operators, see fleet size and photos, and contact operators directly — free, with no login."],
    ["Value for operators", "Direct enquiries from customers searching for exactly what they offer, a listing managed by the Tourzin team, and assisted enquiries from our executives."],
    ["Tamil Nadu focus", "We're starting with Tamil Nadu so we can build strong local supply and understand the needs of travellers and operators here first."],
  ];
  return (
    <>
      <PageHero crumbs={[{ href: "/", label: "Home" }, { label: "About" }]} eyebrow="About" title="Making group travel in Tamil Nadu easier" />
      <section className="container-x grid gap-6 py-12 md:grid-cols-2">
        {blocks.map(([h, p]) => (
          <div key={h} className="card p-6">
            <h2 className="h3">{h}</h2>
            <p className="mt-2 leading-relaxed text-muted">{p}</p>
          </div>
        ))}
        <div className="card border-success/30 p-6 md:col-span-2">
          <div className="flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-success-50 text-success"><IconShield /></span>
            <div>
              <h2 className="h3">Our trust approach</h2>
              <p className="mt-2 leading-relaxed text-muted">
                The Tourzin Verified badge appears only on operators who have completed our formal verification process. We
                never invent ratings, reviews or prices. Before every call or WhatsApp, we show a short safety checklist so customers
                confirm the important details directly with the operator. Final quote, booking and payment are agreed between the
                customer and the operator.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="container-x pb-16">
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-navy p-10 text-center text-white">
          <h2 className="text-2xl font-bold">Find your vehicle or grow your fleet&apos;s bookings</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/search/" className="btn btn-primary">Search Vehicles</Link>
            <Link href="/for-operators/#join" className="btn border border-white/30 text-white hover:bg-white/10">Join Tourzin</Link>
          </div>
        </div>
      </section>
    </>
  );
}
