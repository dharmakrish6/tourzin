"use client";
// Analytics — consistent event names (spec §14). Logged to the repository (mock: localStorage,
// Firebase: events collection) and mirrored to GA4 via gtag when NEXT_PUBLIC_GA_MEASUREMENT_ID is set.

import { db } from "./data";

export type EventName =
  | "homepage_search_started"
  | "search_completed"
  | "district_selected"
  | "vehicle_type_selected"
  | "search_results_viewed"
  | "operator_card_impression"
  | "contact_clicked"
  | "safety_checklist_shown"
  | "safety_checklist_accepted"
  | "call_now_clicked"
  | "number_revealed"
  | "whatsapp_opened"
  | "help_form_started"
  | "help_form_submitted"
  | "no_results_search"
  | "operator_join_started"
  | "operator_join_submitted"
  | "featured_operator_clicked"
  | "vehicle_category_cta_clicked"
  | "district_cta_clicked"
  | "enquiry_outcome"
  | "subscription_payment"
  | "subscription_renewed"
  | "subscription_expired";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const seenImpressions = new Set<string>();

export function track(name: EventName, props: Record<string, string | number | boolean | undefined> = {}) {
  if (typeof window === "undefined") return;
  if (name === "operator_card_impression") {
    const k = `${props.operator_id}|${props.district}`;
    if (seenImpressions.has(k)) return;
    seenImpressions.add(k);
  }
  const e = { name, at: new Date().toISOString(), props };
  db.logEvent(e).catch(() => {});
  window.gtag?.("event", name, props);
  if (process.env.NODE_ENV !== "production") console.debug("[analytics]", name, props);
}
