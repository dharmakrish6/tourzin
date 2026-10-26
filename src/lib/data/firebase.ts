"use client";
// ─────────────────────────────────────────────────────────────────────────────
// FIREBASE REPOSITORY — placeholder for the next phase.
//
// To switch:
//   1. npm install firebase
//   2. Fill NEXT_PUBLIC_FIREBASE_* in .env.local and set NEXT_PUBLIC_DATA_SOURCE=firebase
//   3. Uncomment the implementation below (it is written against the same
//      Repository interface the mock uses, so no page/component changes are needed).
//   4. Deploy firestore.rules from /firebase in this project.
//
// Collections: operators, vehicles, districts, enquiries, payments, operatorLeads,
//              contactMessages, config/site, staff, events
// Staff roles live in staff/{uid}.role ("admin" | "executive") and are enforced in rules.
// ─────────────────────────────────────────────────────────────────────────────

import type { Repository } from "./repository";

const notReady = (): never => {
  throw new Error(
    "Firebase repository is not enabled yet. Install `firebase`, fill .env.local and uncomment src/lib/data/firebase.ts."
  );
};

export const firebaseRepository: Repository = new Proxy({} as Repository, {
  get: () => async () => notReady(),
});

/*
import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore, collection, doc, getDocs, getDoc, setDoc, deleteDoc, addDoc,
  query, orderBy, limit, serverTimestamp, runTransaction,
} from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, signOut as fbSignOut, onAuthStateChanged } from "firebase/auth";
import { getAnalytics, logEvent as gaLog, isSupported } from "firebase/analytics";
import type { Enquiry, StaffUser } from "../types";

const app = getApps()[0] ?? initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});
const fs = getFirestore(app);
const auth = getAuth(app);

const all = async <T,>(name: string) => (await getDocs(collection(fs, name))).docs.map((d) => ({ id: d.id, ...d.data() }) as T);
const put = (name: string, obj: { id: string }) => setDoc(doc(fs, name, obj.id), obj);

export const firebaseRepository: Repository = {
  listOperators: () => all("operators"),
  saveOperator: (o) => put("operators", o),
  deleteOperator: (id) => deleteDoc(doc(fs, "operators", id)),
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
    const now = new Date().toISOString();
    const e: Enquiry = { ...input, id: `ENQ-${n}`, createdAt: now, status: "new", assignedTo: "", followUpDate: now.slice(0, 10), matches: [], customerResponse: "", selectedOperatorId: "", activity: [{ at: now, by: "System", text: "Enquiry submitted" }] };
    tx.set(counterRef, { enquiry: n }, { merge: true });
    tx.set(doc(fs, "enquiries", e.id), e);
    return e;
  }),
  saveEnquiry: (e) => put("enquiries", e),
  listPayments: () => all("payments"),
  savePayment: (p) => put("payments", p),
  listLeads: () => all("operatorLeads"),
  createLead: async (l) => { const ref = await addDoc(collection(fs, "operatorLeads"), { ...l, createdAt: new Date().toISOString(), handled: false }); return { ...l, id: ref.id, createdAt: new Date().toISOString(), handled: false }; },
  saveLead: (l) => put("operatorLeads", l),
  listContactMessages: () => all("contactMessages"),
  createContactMessage: async (m) => { await addDoc(collection(fs, "contactMessages"), { ...m, createdAt: new Date().toISOString() }); },
  getSiteConfig: async () => (await getDoc(doc(fs, "config", "site"))).data() as any,
  saveSiteConfig: (c) => setDoc(doc(fs, "config", "site"), c),
  listStaff: () => all("staff"),
  saveStaff: (u) => put("staff", u),
  signIn: async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const s = await getDoc(doc(fs, "staff", cred.user.uid));
    if (!s.exists() || !s.data().active) { await fbSignOut(auth); throw new Error("Not authorised"); }
    return { id: cred.user.uid, ...s.data() } as StaffUser;
  },
  signOut: () => fbSignOut(auth),
  currentUser: () => new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      unsub();
      if (!u) return resolve(null);
      const s = await getDoc(doc(fs, "staff", u.uid));
      resolve(s.exists() ? ({ id: u.uid, ...s.data() } as StaffUser) : null);
    });
  }),
  logEvent: async (e) => {
    if (await isSupported()) gaLog(getAnalytics(app), e.name, e.props as any);
    await addDoc(collection(fs, "events"), { ...e, ts: serverTimestamp() });
  },
  listEvents: async () => (await getDocs(query(collection(fs, "events"), orderBy("at", "desc"), limit(2000)))).docs.map((d) => d.data() as any),
  resetDemoData: async () => { throw new Error("Not available in Firebase mode"); },
};
*/
