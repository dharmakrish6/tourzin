// Marketplace search, visibility and ranking — spec §7.1–7.3, §13, §20.
// Pure functions: no data access, so the same logic can later run in a
// Cloud Function or stay client-side against Firestore results.

import { categoryById } from "./constants";
import type { Operator, SiteConfig, SubscriptionStatus, Vehicle, VehicleTypeId } from "./types";

export interface SearchParams {
  district: string;
  type?: VehicleTypeId | "";
  passengers?: number;
  sort?: "recommended" | "most";
}

export interface ResultCard {
  operator: Operator;
  photos: string[];
  matchingCount: number;
  group: number;
  relevance: number;
  suitability: number;
  completeness: number;
}

export interface SearchResults {
  local: ResultCard[];
  serving: ResultCard[];
}

const DAY = 86400000;

/** Subscription status taking dates into account (auto Expiring Soon / Expired). */
export function effectiveSubscription(op: Operator, now = new Date()): SubscriptionStatus {
  const s = op.subscriptionStatus;
  if (s === "active" || s === "expiring-soon") {
    const days = Math.ceil((new Date(op.subscriptionExpiry).getTime() - now.getTime()) / DAY);
    if (days < 0) return "expired";
    if (days <= 7) return "expiring-soon";
    return "active";
  }
  return s;
}

export function daysToExpiry(op: Operator, now = new Date()) {
  return Math.ceil((new Date(op.subscriptionExpiry).getTime() - now.getTime()) / DAY);
}

/** Hybrid visibility: default automatic rules + Admin override (spec §13). */
export function isSubscriptionVisible(op: Operator, cfg: Pick<SiteConfig, "trialVisible">, now = new Date()) {
  if (op.visibilityOverride === "force-show") return true;
  if (op.visibilityOverride === "force-hide") return false;
  const s = effectiveSubscription(op, now);
  if (s === "active" || s === "expiring-soon") return true;
  if (s === "trial" || s === "pending-payment") return cfg.trialVisible;
  return false;
}

export function isPubliclyListed(op: Operator, vehicles: Vehicle[], cfg: Pick<SiteConfig, "trialVisible">, now = new Date()) {
  return (
    op.status === "active" &&
    isSubscriptionVisible(op, cfg, now) &&
    vehicles.some((v) => v.operatorId === op.id && v.status === "active" && v.photos.length >= 3)
  );
}

export function isFeaturedEligible(op: Operator, vehicles: Vehicle[], cfg: Pick<SiteConfig, "trialVisible">) {
  return op.plan === "premium" && op.verified && isPubliclyListed(op, vehicles, cfg);
}

export const planGroup = (op: Operator) =>
  op.plan === "premium" ? (op.verified ? 0 : 1) : op.verified ? 2 : 3;

export const PLAN_GROUP_LABEL = ["Premium + Verified", "Premium", "Verified Base", "Base"];

function completeness(op: Operator, vs: Vehicle[]) {
  let s = 0;
  if (op.approxDailyPrice) s++;
  if (op.whatsapp) s++;
  if (op.contactPerson) s++;
  if (op.serviceAreas.length) s++;
  if (vs.length >= 2) s++;
  if (vs.every((v) => v.photos.length >= 3)) s++;
  return s;
}

export function searchOperators(
  params: SearchParams,
  operators: Operator[],
  vehicles: Vehicle[],
  cfg: Pick<SiteConfig, "trialVisible">,
  now = new Date()
): SearchResults {
  const { district, type, passengers, sort = "recommended" } = params;
  const pax = passengers && passengers > 0 ? passengers : 0;
  const local: ResultCard[] = [];
  const serving: ResultCard[] = [];

  for (const op of operators) {
    const isLocal = op.primaryDistrict === district;
    const isServing = !isLocal && op.serviceAreas.includes(district);
    if (!isLocal && !isServing) continue;
    if (!isPubliclyListed(op, vehicles, cfg, now)) continue;

    const active = vehicles.filter(
      (v) => v.operatorId === op.id && v.status === "active" && v.photos.length >= 3 && categoryById(v.type)?.live
    );
    const typed = type ? active.filter((v) => v.type === type) : active;
    if (!typed.length) continue; // vehicle type filter

    const fitsSingle = pax ? typed.some((v) => v.seats >= pax) : true;
    const fitsCombined = pax ? typed.reduce((s, v) => s + v.seats, 0) >= pax : true;
    if (!fitsCombined) continue; // cannot carry the group at all

    const matching = pax ? typed.filter((v) => v.seats >= pax) : typed;
    const showcase = (matching.length ? matching : typed)[0];
    const interior = active.find((v) => v !== showcase) ?? showcase;
    const photos = [showcase.photos[0], showcase.photos[1] ?? interior.photos[1], interior.photos[2] ?? showcase.photos[2]];

    const card: ResultCard = {
      operator: op,
      photos,
      matchingCount: (matching.length || typed.length),
      group: planGroup(op),
      relevance: type ? 1 : 0,
      suitability: fitsSingle ? 1 : 0,
      completeness: completeness(op, active),
    };
    (isLocal ? local : serving).push(card);
  }

  const recommended = (a: ResultCard, b: ResultCard) =>
    a.group - b.group ||
    b.relevance - a.relevance ||
    b.suitability - a.suitability ||
    b.completeness - a.completeness ||
    a.operator.name.localeCompare(b.operator.name);

  const most = (a: ResultCard, b: ResultCard) =>
    b.matchingCount - a.matchingCount ||
    b.operator.totalFleet - a.operator.totalFleet ||
    recommended(a, b);

  const cmp = sort === "most" ? most : recommended;
  // Local section always precedes Serving section — sorting never mixes them.
  return { local: local.sort(cmp), serving: serving.sort(cmp) };
}

export function whatsappMessage(opName: string, p: { district: string; type?: string; passengers?: number }) {
  const what = p.type ? categoryById(p.type)?.name ?? "tourist vehicle" : "tourist vehicle";
  const pax = p.passengers ? ` for ${p.passengers} passengers` : "";
  return `Hi ${opName}, I found you on Tourzin. I'm looking for a ${what}${pax} from ${p.district}. Could you please share availability and a quote?`;
}

export const formatINR = (n: number) => "₹" + n.toLocaleString("en-IN");
