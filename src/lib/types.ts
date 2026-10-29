// Core data model — mirrors spec §12 (Operator / Vehicle) and §9/§13 (Enquiry / Subscription).
// These shapes map 1:1 to Firestore collections later: operators, vehicles, districts,
// enquiries, payments, operatorLeads, contactMessages, siteConfig, users.

export type VehicleTypeId =
  | "tempo-traveller"
  | "urbania"
  | "mini-bus"
  | "tourist-coach"
  | "tourist-bus";

export interface VehicleCategory {
  id: VehicleTypeId;
  name: string;
  shortName: string;
  seatRange: string; // display guidance only (spec §6.3 content rule)
  minSeats: number;
  maxSeats: number;
  live: boolean; // Mini Bus = APPROVED / PLANNED, not live
  blurb: string;
  useCases: string[];
  color: string;
  photo?: string; // real photo under /public; falls back to the /img/vehicles illustrations
}

export interface District {
  id: string; // slug
  name: string;
  approvedPage: boolean; // manually approved district SEO page (spec §15.2)
  popular: boolean; // homepage "Popular Districts" (fixed manually)
  intro?: string;
  highlights?: string[];
}

export type Plan = "base" | "premium";

export type SubscriptionStatus =
  | "trial"
  | "pending-payment"
  | "active"
  | "expiring-soon"
  | "expired"
  | "paused"
  | "cancelled";

export type OperatorStatus =
  | "new-lead"
  | "contacted"
  | "onboarding"
  | "pending-verification"
  | "active"
  | "paused"
  | "rejected";

export type VisibilityOverride = "auto" | "force-show" | "force-hide";

export interface Operator {
  id: string;
  name: string;
  contactPerson: string;
  mobile: string;
  whatsapp: string;
  primaryDistrict: string; // District id
  serviceAreas: string[]; // District ids
  totalFleet: number;
  approxDailyPrice: number | null; // nullable, never used for ranking (spec §20)
  plan: Plan;
  subscriptionStatus: SubscriptionStatus;
  subscriptionStart: string; // ISO date
  subscriptionExpiry: string; // ISO date
  visibilityOverride: VisibilityOverride;
  verified: boolean;
  status: OperatorStatus;
  joinDate: string;
  featured: boolean;
  internalNotes: string;
}

export type VehicleStatus = "draft" | "pending-review" | "active" | "paused" | "rejected";

export interface Vehicle {
  id: string;
  operatorId: string;
  type: VehicleTypeId;
  model: string;
  seats: number;
  ac: boolean;
  district: string;
  serviceAreas: string[];
  photos: string[]; // 3+ required for activation
  status: VehicleStatus;
  verified: boolean;
  internalNotes: string;
}

export type EnquiryStatus =
  | "new"
  | "requirement-review"
  | "matching"
  | "checking-availability"
  | "options-ready"
  | "options-sent"
  | "customer-reviewing"
  | "operator-connected"
  | "booked"
  | "not-booked"
  // exceptions
  | "no-supply"
  | "customer-unresponsive"
  | "operator-unresponsive"
  | "cancelled"
  | "invalid";

export type AvailabilityStatus =
  | "pending"
  | "available"
  | "not-available"
  | "tentative"
  | "awaiting-response"
  | "alternative-offered";

export interface EnquiryMatch {
  operatorId: string;
  availability: AvailabilityStatus;
  quote: string; // operator-provided quote/details, free text
  inOptions: boolean;
  note: string;
}

export interface EnquiryActivity {
  at: string;
  by: string;
  text: string;
}

export interface Enquiry {
  id: string;
  createdAt: string;
  source: "web-form" | "no-results" | "phone" | "manual";
  sourceNote: string;
  district: string;
  destination: string;
  travelDate: string;
  returnDate: string;
  passengers: number;
  vehicleType: VehicleTypeId | "any";
  acPreference: "no-preference" | "ac" | "non-ac";
  name: string;
  mobile: string;
  additional: string;
  status: EnquiryStatus;
  assignedTo: string;
  followUpDate: string;
  matches: EnquiryMatch[];
  customerResponse: string;
  selectedOperatorId: string;
  activity: EnquiryActivity[];
}

export interface Payment {
  id: string;
  operatorId: string;
  amount: number;
  date: string;
  mode: "upi" | "bank-transfer" | "cash" | "cheque" | "other";
  reference: string;
  periodStart: string;
  periodEnd: string;
  plan: Plan;
  renewal: boolean;
}

export interface OperatorLead {
  id: string;
  createdAt: string;
  companyName: string;
  contactPerson: string;
  mobile: string;
  whatsapp: string;
  district: string;
  vehicleTypes: VehicleTypeId[];
  fleetSize: string;
  handled: boolean;
}

export interface ContactMessage {
  id: string;
  createdAt: string;
  name: string;
  mobile: string;
  email: string;
  subject: string;
  message: string;
}

export interface FaqItem {
  q: string;
  a: string;
  group: string;
  home?: boolean;
}

export interface Guide {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  readMins: number;
  featured: boolean;
  body: { h: string; p: string[] }[];
}

export interface SiteConfig {
  featuredOperatorIds: string[]; // max 4
  popularDistrictIds: string[];
  supportPhone: string;
  supportWhatsapp: string;
  supportEmail: string;
  businessHours: string;
  planPricing: { base: number | null; premium: number | null }; // configurable, not locked
  trialVisible: boolean; // Trial / Pending Payment visibility is configurable (spec §13)
}

export type Role = "admin" | "executive";

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
}

export interface AnalyticsEvent {
  name: string;
  at: string;
  props: Record<string, string | number | boolean | undefined>;
}
