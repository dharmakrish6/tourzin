// The single data-access contract the UI talks to, implemented by firebase.ts (Firestore + Firebase Auth).
// Pages and components never import firebase.ts directly — only `db` from ./index.

import type {
  AnalyticsEvent,
  ContactMessage,
  District,
  Enquiry,
  Operator,
  OperatorLead,
  Payment,
  SiteConfig,
  StaffUser,
  Vehicle,
} from "../types";

export type NewEnquiry = Omit<
  Enquiry,
  "id" | "createdAt" | "status" | "assignedTo" | "followUpDate" | "matches" | "customerResponse" | "selectedOperatorId" | "activity"
>;

export interface Repository {
  // Marketplace
  listOperators(): Promise<Operator[]>;
  saveOperator(op: Operator): Promise<void>;
  deleteOperator(id: string): Promise<void>;
  listVehicles(): Promise<Vehicle[]>;
  saveVehicle(v: Vehicle): Promise<void>;
  deleteVehicle(id: string): Promise<void>;
  listDistricts(): Promise<District[]>;
  saveDistrict(d: District): Promise<void>;

  // Enquiries (Let Tourzin Help + executive)
  listEnquiries(): Promise<Enquiry[]>;
  getEnquiry(id: string): Promise<Enquiry | null>;
  createEnquiry(e: NewEnquiry): Promise<Enquiry>;
  saveEnquiry(e: Enquiry): Promise<void>;

  // Commercial
  listPayments(): Promise<Payment[]>;
  savePayment(p: Payment): Promise<void>;

  // Supply acquisition + contact
  listLeads(): Promise<OperatorLead[]>;
  createLead(l: Omit<OperatorLead, "id" | "createdAt" | "handled">): Promise<OperatorLead>;
  saveLead(l: OperatorLead): Promise<void>;
  listContactMessages(): Promise<ContactMessage[]>;
  createContactMessage(m: Omit<ContactMessage, "id" | "createdAt">): Promise<void>;

  // Config + staff
  getSiteConfig(): Promise<SiteConfig>;
  saveSiteConfig(c: SiteConfig): Promise<void>;
  listStaff(): Promise<StaffUser[]>;
  saveStaff(u: StaffUser): Promise<void>;

  // Auth (Admin / Executive only — no customer or operator login in MVP). Google sign-in.
  signIn(): Promise<StaffUser>;
  signOut(): Promise<void>;
  currentUser(): Promise<StaffUser | null>;

  // Analytics (mirrored to GA4 when configured)
  logEvent(e: AnalyticsEvent): Promise<void>;
  listEvents(): Promise<AnalyticsEvent[]>;
}
