"use client";
import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";
import { districtName } from "@/lib/constants";
import { formatINR } from "@/lib/search";
import type { Operator } from "@/lib/types";
import { IconPhone, IconPin, IconVan, IconWhatsApp } from "./Icons";
import { VerifiedBadge } from "./ui";

/**
 * Operator result card — spec §7.5.
 * Not clickable as a whole; images display-only; Call & WhatsApp equal weight;
 * no matching-type label; no Premium badge; district shown with pin only.
 */
export function OperatorCard({
  operator,
  photos,
  onContact,
  context,
}: {
  operator: Operator;
  photos: string[];
  onContact: (mode: "call" | "whatsapp") => void;
  context: { district: string; section?: string; position?: number };
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          track("operator_card_impression", { operator_id: operator.id, district: context.district, section: context.section, position: context.position });
          io.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [operator.id, context.district, context.section, context.position]);

  const dname = districtName(operator.primaryDistrict);
  const contact = (mode: "call" | "whatsapp") => {
    track("contact_clicked", { operator_id: operator.id, mode, district: context.district, section: context.section });
    onContact(mode);
  };

  return (
    <article ref={ref} className="card card-hover flex flex-col overflow-hidden" aria-label={operator.name}>
      <div className="px-4 pt-4">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3 className="text-[17px] font-bold leading-snug text-navy">{operator.name}</h3>
          {operator.verified && <VerifiedBadge small />}
        </div>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
          <IconVan size={16} /> {operator.totalFleet} {operator.totalFleet === 1 ? "vehicle" : "vehicles"} total
        </p>
      </div>
      <div className="mt-3 grid h-48 grid-cols-[2fr_1fr] gap-1 px-4 sm:h-44 xl:h-48">
        <img
          src={photos[0]}
          alt={`${operator.name} tourist vehicle, exterior`}
          loading="lazy"
          className="h-full w-full rounded-l-lg bg-soft object-cover"
        />
        <div className="grid grid-rows-2 gap-1">
          <img src={photos[1]} alt={`${operator.name} vehicle interior seating`} loading="lazy" className="h-full w-full rounded-tr-lg bg-soft object-cover" />
          <img src={photos[2]} alt={`${operator.name} vehicle, additional view`} loading="lazy" className="h-full w-full rounded-br-lg bg-soft object-cover" />
        </div>
      </div>
      <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
        <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
          <IconPin size={16} className="text-muted" /> {dname}
        </p>
        {operator.approxDailyPrice ? (
          <div className="mt-2">
            <p className="text-lg font-bold text-navy">
              Approx. {formatINR(operator.approxDailyPrice)}
              <span className="text-sm font-medium text-muted">/day</span>
            </p>
            <p className="text-xs leading-snug text-muted">Indicative operator-provided price. Final quote may vary.</p>
          </div>
        ) : (
          <div className="mt-2" />
        )}
        <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
          <button type="button" onClick={() => contact("call")} className="btn btn-call" aria-label={`Call ${operator.name}`}>
            <IconPhone size={18} /> Call
          </button>
          <button type="button" onClick={() => contact("whatsapp")} className="btn btn-whatsapp" aria-label={`WhatsApp ${operator.name}`}>
            <IconWhatsApp size={18} /> WhatsApp
          </button>
        </div>
      </div>
    </article>
  );
}

export function SkeletonCard() {
  return (
    <div className="card overflow-hidden p-4" aria-hidden>
      <div className="skeleton h-5 w-2/3" />
      <div className="skeleton mt-2 h-4 w-1/3" />
      <div className="mt-3 grid h-44 grid-cols-[2fr_1fr] gap-1">
        <div className="skeleton h-full" />
        <div className="grid grid-rows-2 gap-1">
          <div className="skeleton" />
          <div className="skeleton" />
        </div>
      </div>
      <div className="skeleton mt-3 h-4 w-1/4" />
      <div className="skeleton mt-2 h-6 w-1/2" />
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="skeleton h-11" />
        <div className="skeleton h-11" />
      </div>
    </div>
  );
}
