#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// Push the migrated marketplace data into Firestore (tourzin-b6323):
//   operators + vehicles  ← scripts/output/migrated.json (npm run migrate:buses)
//   districts             ← src/lib/constants.ts
//   config/site, staff    ← defaults below (admins = the old site's admin emails)
// Upserts by id; the old site's buses / analytics collections are not touched.
//
// Uses the Firebase CLI login (no service-account key):
//   firebase login && npm run push:firestore            (--dry: print counts only)
// ─────────────────────────────────────────────────────────────────────────────
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { execSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DRY = process.argv.includes("--dry");

// Any firebase command refreshes the CLI's stored access token.
execSync("firebase projects:list", { stdio: "ignore" });
const cli = JSON.parse(readFileSync(`${homedir()}/.config/configstore/firebase-tools.json`, "utf8"));
const token = cli.tokens?.access_token;
if (!token) throw new Error("Not logged in — run `firebase login` first.");
const api = async (url, opts = {}) => {
  const r = await fetch(url, { ...opts, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
  const t = await r.text();
  if (!r.ok) throw new Error(`${r.status} ${url}: ${t.slice(0, 300)}`);
  return t ? JSON.parse(t) : {};
};

const P = "tourzin-b6323";
const BASE = `projects/${P}/databases/(default)/documents`;

const migrated = JSON.parse(readFileSync(`${repo}/scripts/output/migrated.json`, "utf8"));
const { DISTRICTS } = await import(`${repo}/src/lib/constants.ts`);
const contentSrc = readFileSync(`${repo}/src/lib/data/content.ts`, "utf8");
const POPULAR = JSON.parse(contentSrc.match(/popularDistrictIds: (\[[^\]]*\])/)[1]);

const ops = migrated.operators, vehicles = migrated.vehicles;
// Featured: Premium + Verified + Active + has a live non-mini-bus vehicle, popular districts first, max 4.
const FEATURED = ops
  .filter((o) => o.plan === "premium" && o.verified && o.status === "active" && ["active", "expiring-soon"].includes(o.subscriptionStatus))
  .filter((o) => vehicles.some((v) => v.operatorId === o.id && v.status === "active" && v.type !== "mini-bus"))
  .sort((a, b) => (POPULAR.indexOf(a.primaryDistrict) + 1 || 99) - (POPULAR.indexOf(b.primaryDistrict) + 1 || 99))
  .slice(0, 4).map((o) => o.id);
ops.forEach((o) => (o.featured = FEATURED.includes(o.id)));

const site = {
  featuredOperatorIds: FEATURED, popularDistrictIds: POPULAR,
  supportPhone: "+91 90000 00000", supportWhatsapp: "919000000000", supportEmail: "support@tourzin.com",
  businessHours: "Mon–Sat, 9:00 AM – 8:00 PM IST", planPricing: { base: null, premium: null }, trialVisible: true,
};
const ADMINS = ["dharmakrish6@gmail.com", "kgmtravelagency@gmail.com", "kgmmani24@gmail.com"];
const staff = ADMINS.map((email) => ({ id: email, name: email.split("@")[0], email, role: "admin", active: true }));

const val = (v) => {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === "string") return { stringValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(val) } };
  return { mapValue: { fields: fields(v) } };
};
const fields = (o) => Object.fromEntries(Object.entries(o).filter(([, x]) => x !== undefined).map(([k, x]) => [k, val(x)]));

const writes = [];
const add = (col, id, obj) => writes.push({ update: { name: `${BASE}/${col}/${id}`, fields: fields(obj) } });
ops.forEach((o) => add("operators", o.id, o));
vehicles.forEach((v) => add("vehicles", v.id, v));
DISTRICTS.forEach((d) => add("districts", d.id, d));
add("config", "site", site);
staff.forEach((s) => add("staff", s.id, s));

console.log({ operators: ops.length, vehicles: vehicles.length, districts: DISTRICTS.length, staff: staff.length, featured: FEATURED, writes: writes.length });
if (DRY) process.exit(0);
for (let i = 0; i < writes.length; i += 400) {
  await api(`https://firestore.googleapis.com/v1/${BASE}:commit`, { method: "POST", body: JSON.stringify({ writes: writes.slice(i, i + 400) }) });
  console.log("committed", Math.min(i + 400, writes.length));
}
console.log("✓ Done");
