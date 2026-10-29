import type { Metadata } from "next";
import { FaqList } from "@/components/FaqList";
import { JoinForm } from "@/components/forms/JoinForm";
import { IconChart, IconCheckCircle, IconPhone, IconShield, IconStar, IconUsers } from "@/components/Icons";
import { SectionHead } from "@/components/ui";
import { FAQS } from "@/lib/data/content";

export const metadata: Metadata = {
  title: "List Your Tourist Vehicles — Join Tourzin",
  description: "Tempo Traveller, Urbania, coach and tourist bus operators in Tamil Nadu: join Tourzin to get direct customer enquiries by call and WhatsApp.",
  alternates: { canonical: "/for-operators/" },
};

export default function ForOperatorsPage() {
  const opFaqs = FAQS.filter((f) => f.group === "For Operators" || f.group === "Subscription/Joining" || f.group === "Tourzin Verified");
  return (
    <>
      <section className="bg-navy">
        <div className="container-x grid gap-10 py-12 sm:py-16 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div className="text-white">
            <p className="eyebrow mb-3 text-orange">For operators</p>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">Get direct enquiries for your tourist vehicles</h1>
            <p className="mt-4 text-lg text-white/75">
              Tourzin connects tourist vehicle operators across Tamil Nadu with customers planning group trips. Customers call or
              WhatsApp you directly — you agree the quote and booking.
            </p>
            <ul className="mt-6 space-y-3 text-white/90">
              {["Direct calls and WhatsApp enquiries", "Our team sets up your listing for you", "Tourzin Verified badge after verification", "Assisted enquiries matched by our executives"].map((t) => (
                <li key={t} className="flex gap-2"><IconCheckCircle size={20} className="shrink-0 text-orange" />{t}</li>
              ))}
            </ul>
          </div>
          <div id="join" className="scroll-mt-24"><JoinForm /></div>
        </div>
      </section>

      <section id="benefits" className="container-x scroll-mt-24 py-16">
        <SectionHead eyebrow="Why join" title="Why operators join Tourzin" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [IconUsers, "Reach group travellers", "Customers searching specifically for tourist vehicles in your district."],
            [IconPhone, "Direct contact", "Enquiries come straight to your phone and WhatsApp — no middleman."],
            [IconStar, "Assisted matches", "Our executives share suitable enquiries with matching operators."],
            [IconChart, "Managed listing", "We create and maintain your listing and photos for you."],
          ].map(([I, t, d]) => {
            const Icon = I as typeof IconUsers;
            return (
              <div key={t as string} className="card p-6">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue"><Icon /></span>
                <h3 className="h3 mt-4">{t as string}</h3>
                <p className="mt-1 text-sm text-muted">{d as string}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-soft py-16">
        <div className="container-x">
          <SectionHead eyebrow="Process" title="How joining works" />
          <ol className="grid gap-5 md:grid-cols-4">
            {["Submit the Join form", "Our team contacts you", "Share vehicle details & 3+ photos per vehicle", "Listing goes live after review"].map((t, i) => (
              <li key={t} className="card p-5">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-navy font-bold text-white">{i + 1}</span>
                <p className="mt-3 font-semibold text-navy">{t}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="verification" className="container-x grid scroll-mt-24 gap-10 py-16 lg:grid-cols-2">
        <div>
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-success-50 text-success"><IconShield size={26} /></span>
          <h2 className="h2 mt-4">Tourzin Verified</h2>
          <p className="mt-3 text-muted">
            Operators who complete Tourzin&apos;s formal verification process display the Tourzin Verified badge on their listing.
            Our team will guide you through the documents and checks involved.
          </p>
        </div>
        <div>
          <h2 className="h2">Plans</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="card p-6">
              <h3 className="h3">Base</h3>
              <p className="mt-2 text-sm text-muted">Standard listing and direct enquiry eligibility.</p>
            </div>
            <div className="card border-orange/40 p-6 ring-1 ring-orange/30">
              <h3 className="h3">Premium</h3>
              <p className="mt-2 text-sm text-muted">Stronger ranking priority in search plus eligibility for Featured Operators on the homepage.</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted">Our team will share current plan pricing when you join.</p>
        </div>
      </section>

      <section className="bg-soft py-16">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_2fr]">
          <h2 className="h2">Operator FAQ</h2>
          <FaqList items={opFaqs} />
        </div>
      </section>

      <section className="container-x py-16 text-center">
        <h2 className="h2">Ready to get more enquiries?</h2>
        <a href="#join" className="btn btn-primary mt-6">Join Tourzin</a>
      </section>
    </>
  );
}
