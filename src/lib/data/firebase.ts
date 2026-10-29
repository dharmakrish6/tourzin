"use client";
// ─────────────────────────────────────────────────────────────────────────────
// FIREBASE REPOSITORY — Firestore + Firebase Auth (project from NEXT_PUBLIC_FIREBASE_*).
//
// Collections: operators, vehicles, districts, enquiries, payments, operatorLeads,
//              contactMessages, config/site, config/counters, staff, events
// The old site's `buses` / `analytics` collections share this project and are not touched.
// Staff sign in with Google; access comes from staff/{email}.role ("admin" | "executive"),
// enforced in firebase/firestore.rules.
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp, getApps } from "firebase/app";
import {
  initializeFirestore, getFirestore, collection, doc, getDocs, getDoc, setDoc, deleteDoc, addDoc,
  query, orderBy, limit, where, writeBatch, runTransaction,
} from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut, onAuthStateChanged, type User } from "firebase/auth";
import type { AnalyticsEvent, Enquiry, SiteConfig, StaffUser } from "../types";
import { DEFAULT_SITE_CONFIG } from "./content";
import type { Repository } from "./repository";

const existing = getApps()[0];
const app = existing ?? initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
});
// Forms leave optional fields undefined; Firestore rejects those unless told to drop them.
const fs = existing ? getFirestore(app) : initializeFirestore(app, { ignoreUndefinedProperties: true });
const auth = getAuth(app);

const all = async <T,>(name: string) => (await getDocs(collection(fs, name))).docs.map((d) => ({ ...d.data(), id: d.id }) as T);
const put = (name: string, obj: { id: string }) => setDoc(doc(fs, name, obj.id), obj);
const nowIso = () => new Date().toISOString();

// Staff docs are keyed by lower-case email so Admin → Users can add someone before their first sign-in.
async function staffFor(u: User | null): Promise<StaffUser | null> {
  if (!u?.email) return null;
  const s = await getDoc(doc(fs, "staff", u.email.toLowerCase()));
  return s.exists() && s.data().active ? ({ ...s.data(), id: s.id } as StaffUser) : null;
}

export const firebaseRepository: Repository = {
  listOperators: () => all("operators"),
  saveOperator: (o) => put("operators", o),
  deleteOperator: async (id) => {
    const batch = writeBatch(fs);
    (await getDocs(query(collection(fs, "vehicles"), where("operatorId", "==", id)))).docs.forEach((d) => batch.delete(d.ref));
    batch.delete(doc(fs, "operators", id));
    await batch.commit();
  },
  listVehicles: () => all("vehicles"),
  saveVehicle: (v) => put("vehicles", v),
  deleteVehicle: (id) => deleteDoc(doc(fs, "vehicles", id)),
  listDistricts: () => all("districts"),
  saveDistrict: (d) => put("districts", d),

  listEnquiries: async () => (await getDocs(query(collection(fs, "enquiries"), orderBy("createdAt", "desc")))).docs.map((d) => d.data() as Enquiry),
  getEnquiry: async (id) => { const s = await getDoc(doc(fs, "enquiries", id)); return s.exists() ? (s.data() as Enquiry) : null; },
  createEnquiry: async (input) => runTransaction(fs, async (tx) => {
    const counterRef = doc(fs, "config", "counters");
    const n = ((await tx.get(counterRef)).data()?.enquiry ?? 1000) + 1;
    const now = nowIso();
    const text = input.source === "no-results" ? "Enquiry submitted from no-results search" : input.source === "web-form" ? "Enquiry submitted via Let Tourzin Help" : "Enquiry created manually";
    const e: Enquiry = { ...input, id: `ENQ-${n}`, createdAt: now, status: "new", assignedTo: "", followUpDate: now.slice(0, 10), matches: [], customerResponse: "", selectedOperatorId: "", activity: [{ at: now, by: "System", text }] };
    tx.set(counterRef, { enquiry: n }, { merge: true });
    tx.set(doc(fs, "enquiries", e.id), e);
    return e;
  }),
  saveEnquiry: (e) => put("enquiries", e),

  listPayments: () => all("payments"),
  savePayment: (p) => put("payments", p),

  listLeads: async () => (await getDocs(query(collection(fs, "operatorLeads"), orderBy("createdAt", "desc")))).docs.map((d) => ({ ...d.data(), id: d.id }) as any),
  createLead: async (l) => {
    const lead = { ...l, createdAt: nowIso(), handled: false };
    const ref = await addDoc(collection(fs, "operatorLeads"), lead);
    return { ...lead, id: ref.id };
  },
  saveLead: (l) => put("operatorLeads", l),
  listContactMessages: async () => (await getDocs(query(collection(fs, "contactMessages"), orderBy("createdAt", "desc")))).docs.map((d) => ({ ...d.data(), id: d.id }) as any),
  createContactMessage: async (m) => { await addDoc(collection(fs, "contactMessages"), { ...m, createdAt: nowIso() }); },

  getSiteConfig: async () => ({ ...DEFAULT_SITE_CONFIG, ...((await getDoc(doc(fs, "config", "site"))).data() as Partial<SiteConfig> | undefined) }),
  saveSiteConfig: (c) => setDoc(doc(fs, "config", "site"), c),
  listStaff: () => all("staff"),
  saveStaff: (u) => {
    const email = u.email.trim().toLowerCase();
    return put("staff", { ...u, id: email, email } as StaffUser);
  },

  signIn: async () => {
    const cred = await signInWithPopup(auth, new GoogleAuthProvider());
    const staff = await staffFor(cred.user);
    if (!staff) { await fbSignOut(auth); throw new Error(`${cred.user.email} is not a Tourzin staff account. Ask an admin to add you in Users & Roles.`); }
    return staff;
  },
  signOut: () => fbSignOut(auth),
  currentUser: () => new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      unsub();
      resolve(await staffFor(u).catch(() => null));
    });
  }),

  logEvent: async (e) => { await addDoc(collection(fs, "events"), e); },
  listEvents: async () => (await getDocs(query(collection(fs, "events"), orderBy("at", "desc"), limit(5000)))).docs.map((d) => d.data() as AnalyticsEvent),
};
