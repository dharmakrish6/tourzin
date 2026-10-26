"use client";
// Mock repository: dummy seed data, persisted per-browser in localStorage so that
// changes made in Admin / Executive screens show up on the public site during demos.

import { DISTRICTS } from "../constants";
import type { District, StaffUser } from "../types";
import type { Repository } from "./repository";
import {
  DEMO_PASSWORDS,
  seedEnquiries,
  seedLeads,
  seedOperators,
  seedPayments,
  seedSiteConfig,
  seedStaff,
  seedVehicles,
  seedEvents,
} from "./seed";

const KEY = "tourzin:mockdb:v2"; // bump when seed data shape/content changes
const SESSION_KEY = "tourzin:session";

type DB = {
  operators: typeof seedOperators;
  vehicles: typeof seedVehicles;
  districts: District[];
  enquiries: typeof seedEnquiries;
  payments: typeof seedPayments;
  leads: typeof seedLeads;
  contacts: import("../types").ContactMessage[];
  config: typeof seedSiteConfig;
  staff: typeof seedStaff;
  events: import("../types").AnalyticsEvent[];
};

const fresh = (): DB =>
  structuredClone({
    operators: seedOperators,
    vehicles: seedVehicles,
    districts: DISTRICTS,
    enquiries: seedEnquiries,
    payments: seedPayments,
    leads: seedLeads,
    contacts: [],
    config: seedSiteConfig,
    staff: seedStaff,
    events: seedEvents,
  });

let memory: DB | null = null;

function load(): DB {
  if (memory) return memory;
  if (typeof window === "undefined") return (memory = fresh());
  try {
    const raw = window.localStorage.getItem(KEY);
    memory = raw ? { ...fresh(), ...JSON.parse(raw) } : fresh();
  } catch {
    memory = fresh();
  }
  return memory!;
}

function persist() {
  if (typeof window === "undefined" || !memory) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(memory));
  } catch {
    /* storage full / blocked — keep in-memory */
  }
}

// small artificial latency so loading states are visible like a real backend
const wait = <T,>(v: T, ms = 220) => new Promise<T>((r) => setTimeout(() => r(structuredClone(v)), ms));

function upsert<T extends { id: string }>(list: T[], item: T) {
  const i = list.findIndex((x) => x.id === item.id);
  if (i >= 0) list[i] = item;
  else list.unshift(item);
}

const id = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const mockRepository: Repository = {
  listOperators: async () => wait(load().operators),
  saveOperator: async (op) => { upsert(load().operators, op); persist(); },
  deleteOperator: async (opId) => {
    const db = load();
    db.operators = db.operators.filter((o) => o.id !== opId);
    db.vehicles = db.vehicles.filter((v) => v.operatorId !== opId);
    persist();
  },
  listVehicles: async () => wait(load().vehicles),
  saveVehicle: async (v) => { upsert(load().vehicles, v); persist(); },
  deleteVehicle: async (vid) => { const db = load(); db.vehicles = db.vehicles.filter((v) => v.id !== vid); persist(); },
  listDistricts: async () => wait(load().districts, 50),
  saveDistrict: async (d) => { upsert(load().districts, d); persist(); },

  listEnquiries: async () => wait([...load().enquiries].sort((a, b) => b.createdAt.localeCompare(a.createdAt))),
  getEnquiry: async (eid) => wait(load().enquiries.find((e) => e.id === eid) ?? null),
  createEnquiry: async (input) => {
    const db = load();
    const max = db.enquiries.reduce((m, e) => Math.max(m, parseInt(e.id.split("-")[1] || "0", 10)), 1000);
    const now = new Date().toISOString();
    const e = {
      ...input,
      id: `ENQ-${max + 1}`,
      createdAt: now,
      status: "new" as const,
      assignedTo: "",
      followUpDate: now.slice(0, 10),
      matches: [],
      customerResponse: "",
      selectedOperatorId: "",
      activity: [{ at: now, by: "System", text: input.source === "no-results" ? "Enquiry submitted from no-results search" : input.source === "web-form" ? "Enquiry submitted via Let Tourzin Help" : "Enquiry created manually" }],
    };
    db.enquiries.unshift(e);
    persist();
    return wait(e, 400);
  },
  saveEnquiry: async (e) => { upsert(load().enquiries, e); persist(); },

  listPayments: async () => wait(load().payments),
  savePayment: async (p) => { upsert(load().payments, p); persist(); },

  listLeads: async () => wait(load().leads),
  createLead: async (l) => {
    const lead = { ...l, id: id("lead"), createdAt: new Date().toISOString(), handled: false };
    load().leads.unshift(lead);
    persist();
    return wait(lead, 400);
  },
  saveLead: async (l) => { upsert(load().leads, l); persist(); },
  listContactMessages: async () => wait(load().contacts),
  createContactMessage: async (m) => {
    load().contacts.unshift({ ...m, id: id("msg"), createdAt: new Date().toISOString() });
    persist();
    await wait(null, 400);
  },

  getSiteConfig: async () => wait(load().config, 60),
  saveSiteConfig: async (c) => { load().config = c; persist(); },
  listStaff: async () => wait(load().staff),
  saveStaff: async (u) => { upsert(load().staff, u); persist(); },

  signIn: async (email, password) => {
    const user = load().staff.find((s) => s.email.toLowerCase() === email.trim().toLowerCase() && s.active);
    const expected = user ? DEMO_PASSWORDS[user.email] ?? "tourzin123" : undefined;
    if (!user || password !== expected) {
      await wait(null, 300);
      throw new Error("Invalid email or password");
    }
    window.sessionStorage.setItem(SESSION_KEY, user.id);
    return wait(user, 300);
  },
  signOut: async () => { window.sessionStorage.removeItem(SESSION_KEY); },
  currentUser: async () => {
    if (typeof window === "undefined") return null;
    const uid = window.sessionStorage.getItem(SESSION_KEY);
    return (load().staff.find((s) => s.id === uid && s.active) as StaffUser) ?? null;
  },

  logEvent: async (e) => {
    const db = load();
    db.events.push(e);
    if (db.events.length > 6000) db.events = db.events.slice(-6000);
    persist();
  },
  listEvents: async () => wait(load().events, 50),

  resetDemoData: async () => {
    memory = fresh();
    persist();
  },
};
