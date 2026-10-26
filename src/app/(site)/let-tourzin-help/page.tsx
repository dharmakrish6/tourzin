import type { Metadata } from "next";
import { Suspense } from "react";
import { HelpForm } from "@/components/forms/HelpForm";
import { IconCheckCircle, IconPhone } from "@/components/Icons";
import { PageHero } from "@/components/ui";
import { seedSiteConfig } from "@/lib/data/seed";

export const metadata: Metadata = {
  title: "Let Tourzin Help Find the Right Vehicle",
  description: "Share your trip requirement and a Tourzin executive will match suitable tourist vehicle operators in Tamil Nadu. No login needed.",
  alternates: { canonical: "/let-tourzin-help/" },
};

export default function HelpPage() {
  return (
    <>
      <PageHero
        eyebrow="Assisted search"
        title="Let Tourzin Help Find the Right Vehicle"
        sub="Tell us about your trip. A Tourzin executive will check with suitable operators and share options with you — then connect you with the one you choose."
      />
      <section className="container-x grid gap-10 py-12 lg:grid-cols-[1.6fr_1fr]">
        <Suspense fallback={<div className="card h-96 p-6"><div className="skeleton h-full" /></div>}>
          <HelpForm />
        </Suspense>
        <aside className="space-y-5">
          <div className="card p-6">
            <h2 className="h3">How it works</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {["We review your requirement", "We check with suitable operators", "We share shortlisted options", "We connect you with the operator you choose"].map((t) => (
                <li key={t} className="flex gap-2"><IconCheckCircle size={18} className="shrink-0 text-success" />{t}</li>
              ))}
            </ul>
            <p className="mt-4 rounded-lg bg-soft p-3 text-xs leading-relaxed text-muted">
              Tourzin does not promise availability or a quotation. Final quote, booking and payment are agreed directly with the operator.
            </p>
          </div>
          <div className="card p-6">
            <h2 className="h3">Prefer to speak?</h2>
            <p className="mt-1 text-sm text-muted">{seedSiteConfig.businessHours}</p>
            <a href={`tel:${seedSiteConfig.supportPhone.replace(/\s/g, "")}`} className="btn btn-secondary mt-4 w-full">
              <IconPhone size={18} /> Call Tourzin
            </a>
          </div>
        </aside>
      </section>
    </>
  );
}
