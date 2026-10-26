#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// Migrate the OLD Tourzin site's bus listings into the NEW data model.
//
//   Old model (tourbus repo):  one "bus" = operator + one vehicle
//     sources: buses.json base catalog  +  Firestore `buses` overrides/additions
//              (same merge as the old site: matching id overrides, deleted:true hides)
//   New model (this app):      operators[]  +  vehicles[]   (src/lib/types.ts)
//
// Usage
//   node scripts/migrate-buses.mjs
//       → reads scripts/legacy/buses.json + LIVE Firestore `buses` (public read),
//         writes src/lib/data/migrated.json and prints a report.
//   node scripts/migrate-buses.mjs --offline
//       → legacy file only (no network).
//   node scripts/migrate-buses.mjs --write --service-account ./serviceAccount.json
//       → also writes operators/vehicles into Firestore (needs `npm i -D firebase-admin`).
//         Existing `buses` / `analytics` collections are NOT touched.
//
// Options: --legacy <file>  --out <file>  --project <id>  --api-key <key>
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const flag = (n) => args.includes(`--${n}`);
const opt = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 ? args[i + 1] : d;
};

// Load .env for project id / api key
const env = {};
if (existsSync(resolve(ROOT, ".env")))
  readFileSync(resolve(ROOT, ".env"), "utf8").split("\n").forEach((l) => {
    const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2];
  });

const PROJECT = opt("project", env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "tourzin-b6323");
const API_KEY = opt("api-key", env.NEXT_PUBLIC_FIREBASE_API_KEY || "");
const LEGACY = resolve(ROOT, opt("legacy", "scripts/legacy/buses.json"));
const OUT = resolve(ROOT, opt("out", "src/lib/data/migrated.json"));

// ── District ids from the new app (src/lib/constants.ts) ────────────────────
const slug = (s) => String(s || "").toLowerCase().replace(/\(.*?\)/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const constants = readFileSync(resolve(ROOT, "src/lib/constants.ts"), "utf8");
const DISTRICT_IDS = new Set([...constants.matchAll(/D\("([^"]+)"/g)].map((m) => slug(m[1])));
const DISTRICT_ALIASES = {
  kanyakumari: "kanniyakumari", nagercoil: "kanniyakumari",
  villupuram: "viluppuram",
  kanchipuram: "kancheepuram",
  tirupattur: "tirupathur",
  ooty: "nilgiris", "the-nilgiris": "nilgiris",
  trichy: "tiruchirappalli", tiruchi: "tiruchirappalli",
  thoothukkudi: "thoothukudi", tuticorin: "thoothukudi",
  tiruvallur: "tiruvallur", thiruvallur: "tiruvallur",
};
function districtId(name, fallbackId) {
  for (const c of [name, fallbackId]) {
    const s = slug(c);
    if (!s) continue;
    if (DISTRICT_IDS.has(s)) return s;
    if (DISTRICT_ALIASES[s]) return DISTRICT_ALIASES[s];
  }
  return null;
}

// ── Vehicle type mapping (old free-text types → 5 new categories) ───────────
function vehicleType(type, seats) {
  const t = String(type || "").toLowerCase();
  if (/urbania/.test(t)) return "urbania";
  if (/\btt\b|tempo|traveller|van/.test(t)) return "tempo-traveller";
  if (/mini/.test(t)) return "mini-bus";
  if (/coach/.test(t)) return "tourist-coach";
  // generic "Bus", "AC Luxury", "Non-AC Deluxe", "Sleeper"… → decide by seats
  if (seats && seats <= 17) return "tempo-traveller";
  if (seats && seats <= 26) return "mini-bus";
  if (seats && seats <= 35) return "tourist-coach";
  return "tourist-bus";
}
const isAC = (b) => {
  const t = String(b.type || "").toLowerCase();
  if (/non[\s-]?ac/.test(t)) return false;
  const am = (Array.isArray(b.amenities) ? b.amenities : String(b.amenities || "").split(",")).map((a) => String(a).trim().toLowerCase());
  if (am.includes("ac") || /\bac\b/.test(t)) return true;
  return am.includes("non-ac") || am.includes("non ac") ? false : true;
};
const mobile10 = (s) => {
  const d = String(s || "").replace(/\D/g, "");
  return d.length >= 10 ? d.slice(-10) : "";
};
const toNum = (v) => (typeof v === "number" ? v : Number(String(v ?? "").replace(/[^\d.]/g, "")) || 0);

// ── Firestore REST (public read on `buses`, per the old site's rules) ───────
function fromFsValue(v) {
  if (!v || typeof v !== "object") return v;
  if ("stringValue" in v) return v.stringValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return v.doubleValue;
  if ("booleanValue" in v) return v.booleanValue;
  if ("nullValue" in v) return null;
  if ("timestampValue" in v) return v.timestampValue;
  if ("arrayValue" in v) return (v.arrayValue.values || []).map(fromFsValue);
  if ("mapValue" in v) return Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, fromFsValue(x)]));
  return null;
}
async function fetchLiveBuses() {
  const out = [];
  let pageToken = "";
  do {
    const u = new URL(`https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/buses`);
    u.searchParams.set("pageSize", "300");
    if (pageToken) u.searchParams.set("pageToken", pageToken);
    if (API_KEY) u.searchParams.set("key", API_KEY);
    const res = await fetch(u);
    if (!res.ok) throw new Error(`Firestore ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const j = await res.json();
    for (const d of j.documents || []) {
      const id = d.name.split("/").pop();
      out.push({ id, ...Object.fromEntries(Object.entries(d.fields || {}).map(([k, v]) => [k, fromFsValue(v)])) });
    }
    pageToken = j.nextPageToken || "";
  } while (pageToken);
  return out;
}

// ── Merge exactly like the old site (js/data.js buildMergedBusMap) ──────────
function mergeBuses(baseDistricts, overrides) {
  const map = new Map();
  for (const d of baseDistricts || [])
    for (const b of d.buses || []) {
      if (map.has(b.id)) report.warnings.push(`Duplicate bus id ${b.id} in buses.json ("${map.get(b.id).operator}" and "${b.operator}") — the old site showed only the last one; same here. Re-add the other in Admin if it's real.`);
      map.set(b.id, { ...b, district: d.name, districtId: d.id, deleted: false, _source: "buses.json" });
    }
  for (const doc of overrides || []) {
    if (!doc?.id) continue;
    const prior = map.get(doc.id);
    map.set(doc.id, {
      ...(prior || {}),
      ...doc,
      district: doc.district || prior?.district || "Custom",
      districtId: doc.districtId || prior?.districtId || slug(doc.district || "custom"),
      deleted: !!doc.deleted,
      _source: prior ? "buses.json + firestore edit" : "firestore",
    });
  }
  return [...map.values()];
}

// ── Main ─────────────────────────────────────────────────────────────────────
const report = { generatedAt: new Date().toISOString(), sources: [], skipped: [], warnings: [], typeMapping: {} };

const legacy = existsSync(LEGACY) ? JSON.parse(readFileSync(LEGACY, "utf8")) : { districts: [] };
const baseDistricts = legacy.districts || [];
report.sources.push(`${LEGACY.replace(ROOT + "/", "")}: ${baseDistricts.reduce((s, d) => s + (d.buses?.length || 0), 0)} buses`);

let live = [];
if (!flag("offline")) {
  try {
    live = await fetchLiveBuses();
    report.sources.push(`Firestore ${PROJECT}/buses: ${live.length} docs`);
  } catch (e) {
    report.warnings.push(`Could not read live Firestore buses (${e.message}). Using legacy file only — re-run where Firestore is reachable to include admin edits made on the old site.`);
  }
} else report.sources.push("Firestore: skipped (--offline)");

const buses = mergeBuses(baseDistricts, live);
const today = new Date().toISOString().slice(0, 10);
const nextYear = (() => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d.toISOString().slice(0, 10); })();

const operators = new Map();
const vehicles = [];
const counters = {};

for (const b of buses) {
  const label = `${b.id} (${b.operator || "no operator"})`;
  if (b.deleted) { report.skipped.push(`${label}: soft-deleted on old site`); continue; }
  const name = String(b.operator || "").trim();
  if (!name || name.length > 80 || /<|IP address|About this page/i.test(name)) { report.skipped.push(`${label}: invalid operator name`); continue; }
  const did = districtId(b.district, b.districtId);
  if (!did) { report.skipped.push(`${label}: unknown district "${b.district}"`); continue; }
  const seats = Math.round(toNum(b.seats));
  const type = vehicleType(b.type, seats);
  report.typeMapping[`${b.type || "(none)"} → ${type}`] = (report.typeMapping[`${b.type || "(none)"} → ${type}`] || 0) + 1;
  const mob = mobile10(b.contact);
  if (!mob) report.warnings.push(`${label}: no valid 10-digit mobile in "${b.contact}"`);

  // One operator per (name, district). Old data had one bus per record.
  const key = `${slug(name)}|${did}`;
  let op = operators.get(key);
  if (!op) {
    const paid = b.paid === true || b.paid === "true";
    op = {
      id: `op-${slug(name)}-${did}`.slice(0, 80),
      name,
      contactPerson: "",
      mobile: mob,
      whatsapp: mob,
      primaryDistrict: did,
      serviceAreas: [],
      totalFleet: 0,
      approxDailyPrice: null,
      // Assumption: old "paid" listing → Premium + Active; unpaid → Base on Trial
      plan: paid ? "premium" : "base",
      subscriptionStatus: paid ? "active" : "trial",
      subscriptionStart: today,
      subscriptionExpiry: nextYear,
      visibilityOverride: "auto",
      verified: b.verified === true || b.verified === "true",
      status: "active",
      joinDate: today,
      featured: false,
      internalNotes: "",
      _notes: [],
    };
    operators.set(key, op);
  }
  op.totalFleet += 1;
  const rent = toNum(b.perDayRent);
  if (rent > 0) op.approxDailyPrice = op.approxDailyPrice ? Math.min(op.approxDailyPrice, rent) : rent;
  if (b.verified === true) op.verified = true;
  if (!op.mobile && mob) op.mobile = op.whatsapp = mob;
  const extra = [b.email && `Email: ${b.email}`, b.location && `Location: ${b.location}`, b.rating && `Old-site rating: ${b.rating}`].filter(Boolean);
  extra.forEach((x) => !op._notes.includes(x) && op._notes.push(x));

  counters[op.id] = (counters[op.id] || 0) + 1;
  const n = ((vehicles.length) % 4) + 1;
  const alt = ((vehicles.length + 2) % 4) + 1;
  const amen = Array.isArray(b.amenities) ? b.amenities : String(b.amenities || "").split(",").map((s) => s.trim()).filter(Boolean);
  vehicles.push({
    id: `${op.id}-v${counters[op.id]}`,
    operatorId: op.id,
    type,
    model: `${b.type || "Vehicle"}${seats ? ` · ${seats} seats` : ""}`,
    seats,
    ac: isAC(b),
    district: did,
    serviceAreas: [],
    // Old site had no photos → placeholder illustrations so listings stay visible.
    photos: [`/img/vehicles/${type}-${n}.svg`, `/img/vehicles/interior-${n}.svg`, `/img/vehicles/${type}-${alt}.svg`],
    status: b.available === false || b.available === "false" ? "paused" : "active",
    verified: b.verified === true || b.verified === "true",
    internalNotes: [`Migrated from old site bus ${b.id} (${b._source})`, "PLACEHOLDER PHOTOS — replace with real photos", amen.length && `Amenities: ${amen.join(", ")}`].filter(Boolean).join(" · "),
  });
}

const opList = [...operators.values()].map(({ _notes, ...o }) => ({
  ...o,
  internalNotes: ["Migrated from old Tourzin site", ..._notes].join(" · "),
}));
const miniBus = vehicles.filter((v) => v.type === "mini-bus").length;
if (miniBus) report.warnings.push(`${miniBus} vehicle(s) mapped to Mini Bus, which is APPROVED/PLANNED (not live) — they stay hidden from search until Mini Bus launches. Change their type in Admin → Vehicles if needed.`);

const result = {
  _comment: "Generated by scripts/migrate-buses.mjs from the old Tourzin bus catalog. Do not edit by hand — re-run the script.",
  report: { ...report, operators: opList.length, vehicles: vehicles.length },
  operators: opList,
  vehicles,
};
writeFileSync(OUT, JSON.stringify(result, null, 2) + "\n");

console.log(`\n✓ Wrote ${OUT.replace(ROOT + "/", "")}`);
console.log(`  ${opList.length} operators · ${vehicles.length} vehicles`);
report.sources.forEach((s) => console.log(`  source: ${s}`));
console.log("  type mapping:", report.typeMapping);
if (report.skipped.length) console.log(`  skipped ${report.skipped.length}:\n   - ${report.skipped.join("\n   - ")}`);
if (report.warnings.length) console.log(`  warnings:\n   - ${report.warnings.join("\n   - ")}`);

// ── Optional: write into Firestore (new collections) ────────────────────────
if (flag("write")) {
  const saPath = opt("service-account");
  if (!saPath) { console.error("\n✗ --write needs --service-account <key.json> (Firebase console → Project settings → Service accounts)."); process.exit(1); }
  let admin;
  try { admin = (await import("firebase-admin")).default; }
  catch { console.error("\n✗ Install firebase-admin first:  npm i -D firebase-admin"); process.exit(1); }
  admin.initializeApp({ credential: admin.credential.cert(JSON.parse(readFileSync(resolve(saPath), "utf8"))), projectId: PROJECT });
  const fs = admin.firestore();
  const all = [...opList.map((o) => ["operators", o]), ...vehicles.map((v) => ["vehicles", v])];
  for (let i = 0; i < all.length; i += 400) {
    const batch = fs.batch();
    all.slice(i, i + 400).forEach(([col, doc]) => batch.set(fs.collection(col).doc(doc.id), doc, { merge: true }));
    await batch.commit();
  }
  console.log(`\n✓ Wrote ${opList.length} operators and ${vehicles.length} vehicles to Firestore project ${PROJECT}. Old 'buses' collection untouched.`);
}
