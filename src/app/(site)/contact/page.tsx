import type { Metadata } from "next";
import { ContactForm } from "@/components/forms/ContactForm";
import { IconClock, IconMail, IconPhone, IconWhatsApp } from "@/components/Icons";
import { PageHero } from "@/components/ui";
import { seedSiteConfig as cfg } from "@/lib/data/seed";

export const metadata: Metadata = {
  title: "Contact Tourzin",
  description: "Get in touch with Tourzin for help finding a tourist vehicle or listing your vehicles in Tamil Nadu.",
  alternates: { canonical: "/contact/" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero crumbs={[{ href: "/", label: "Home" }, { label: "Contact" }]} eyebrow="Contact" title="Contact Tourzin" sub="Questions about a trip, a listing or Tourzin itself? We're happy to help." />
      <section className="container-x grid gap-10 py-12 lg:grid-cols-[1.6fr_1fr]">
        <ContactForm />
        <aside className="card h-fit space-y-5 p-6">
          <h2 className="h3">Reach us directly</h2>
          <p className="flex items-center gap-3"><IconPhone className="text-blue" /> <a href={`tel:${cfg.supportPhone.replace(/\s/g, "")}`} className="hover:underline">{cfg.supportPhone}</a></p>
          <p className="flex items-center gap-3"><IconWhatsApp className="text-whatsapp" /> <a href={`https://wa.me/${cfg.supportWhatsapp}`} className="hover:underline" target="_blank" rel="noopener noreferrer">WhatsApp us</a></p>
          <p className="flex items-center gap-3"><IconMail className="text-blue" /> <a href={`mailto:${cfg.supportEmail}`} className="hover:underline">{cfg.supportEmail}</a></p>
          <p className="flex items-center gap-3"><IconClock className="text-blue" /> {cfg.businessHours}</p>
        </aside>
      </section>
    </>
  );
}
