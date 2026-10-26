// DUMMY DATA — used while NEXT_PUBLIC_DATA_SOURCE=mock.
// All operator names, phone numbers and prices here are fictional placeholders.
// When switching to Firebase, import this same shape into Firestore (see README),
// or start with empty collections.

import type {
  Enquiry,
  FaqItem,
  Guide,
  Operator,
  OperatorLead,
  Payment,
  SiteConfig,
  StaffUser,
  Vehicle,
  VehicleTypeId,
  Plan,
  SubscriptionStatus,
  OperatorStatus,
} from "../types";

const today = new Date();
const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return iso(d);
};

type OpSeed = [
  name: string,
  contact: string,
  district: string,
  serves: string[],
  plan: Plan,
  verified: boolean,
  price: number | null,
  sub: SubscriptionStatus,
  expiresInDays: number,
  status: OperatorStatus,
  fleet: [VehicleTypeId, number, number, boolean][], // type, seats, count, ac
];

const OPS: OpSeed[] = [
  ["Sri Murugan Tours & Travels", "R. Senthil", "chennai", ["chengalpattu", "kancheepuram", "tiruvallur", "viluppuram"], "premium", true, 8500, "active", 160, "active", [["tempo-traveller", 12, 3, true], ["tempo-traveller", 17, 2, true], ["urbania", 13, 2, true], ["tourist-bus", 49, 2, true]]],
  ["Marina Holidays", "K. Priya", "chennai", ["chengalpattu", "kancheepuram"], "premium", false, 9000, "active", 90, "active", [["urbania", 10, 2, true], ["urbania", 17, 1, true], ["tempo-traveller", 14, 2, true]]],
  ["Chennai Comfort Coaches", "A. Rahman", "chennai", ["tiruvallur", "vellore", "ranipet"], "base", true, null, "active", 40, "active", [["tourist-coach", 35, 2, true], ["tourist-bus", 45, 3, true], ["tourist-bus", 55, 1, false]]],
  ["ECR Travel Point", "S. Vignesh", "chengalpattu", ["chennai", "kancheepuram", "viluppuram"], "base", false, 7500, "expiring-soon", 5, "active", [["tempo-traveller", 12, 2, true], ["tempo-traveller", 17, 1, false]]],
  ["Velan Travels", "M. Karthik", "chennai", ["chengalpattu"], "base", false, 7000, "active", 220, "active", [["tempo-traveller", 12, 2, false], ["tempo-traveller", 14, 1, true]]],
  ["Kovai Kings Travels", "P. Saravanan", "coimbatore", ["nilgiris", "tiruppur", "erode"], "premium", true, 9500, "active", 120, "active", [["tempo-traveller", 14, 3, true], ["urbania", 17, 2, true], ["tourist-coach", 30, 2, true], ["tourist-bus", 49, 1, true]]],
  ["Nilgiri Trails", "J. Thomas", "nilgiris", ["coimbatore", "erode"], "premium", true, 10500, "active", 75, "active", [["tempo-traveller", 12, 4, false], ["tempo-traveller", 17, 2, true]]],
  ["Siruvani Tours", "L. Ganesh", "coimbatore", ["tiruppur", "nilgiris"], "base", true, 8000, "active", 30, "active", [["tempo-traveller", 12, 2, true], ["tourist-bus", 45, 2, true]]],
  ["Tiruppur Express Travels", "N. Balaji", "tiruppur", ["coimbatore", "erode"], "base", false, null, "active", 100, "active", [["tourist-coach", 32, 1, true], ["tempo-traveller", 14, 2, true]]],
  ["Meenakshi Travels", "S. Pandian", "madurai", ["dindigul", "theni", "virudhunagar", "sivaganga", "ramanathapuram"], "premium", true, 8200, "active", 200, "active", [["tempo-traveller", 12, 3, true], ["tempo-traveller", 17, 2, true], ["tourist-coach", 35, 2, true], ["tourist-bus", 49, 2, true]]],
  ["Vaigai Holidays", "R. Muthu", "madurai", ["dindigul", "theni"], "base", true, 7800, "active", 60, "active", [["urbania", 13, 1, true], ["tempo-traveller", 14, 2, true]]],
  ["Temple City Coaches", "K. Arumugam", "madurai", ["ramanathapuram", "sivaganga", "tirunelveli"], "premium", false, null, "active", 140, "active", [["tourist-bus", 49, 3, true], ["tourist-bus", 55, 2, false], ["tourist-coach", 30, 1, true]]],
  ["Kodai Cruisers", "F. Joseph", "dindigul", ["madurai", "theni"], "base", false, 8800, "active", 18, "active", [["tempo-traveller", 12, 2, false], ["tempo-traveller", 14, 1, false]]],
  ["Yercaud Travels", "V. Mani", "salem", ["namakkal", "dharmapuri", "erode"], "premium", true, 7900, "active", 95, "active", [["tempo-traveller", 12, 3, true], ["tempo-traveller", 17, 2, true], ["urbania", 13, 1, true], ["tourist-bus", 45, 2, true]]],
  ["Steel City Tours", "G. Ravi", "salem", ["namakkal", "krishnagiri"], "base", true, 7200, "active", 50, "active", [["tempo-traveller", 14, 2, true], ["tourist-coach", 32, 1, true]]],
  ["Kolli Hills Travel Co.", "S. Selvam", "namakkal", ["salem", "tiruchirappalli"], "base", false, null, "active", 80, "active", [["tempo-traveller", 12, 2, false]]],
  ["Rockfort Travels", "A. Kumar", "tiruchirappalli", ["thanjavur", "pudukkottai", "karur", "perambalur", "ariyalur"], "premium", true, 8300, "active", 180, "active", [["tempo-traveller", 12, 3, true], ["tempo-traveller", 17, 1, true], ["tourist-bus", 49, 2, true]]],
  ["Srirangam Yatra Services", "R. Ranganathan", "tiruchirappalli", ["thanjavur", "karur"], "base", true, 7600, "active", 25, "active", [["urbania", 13, 1, true], ["tourist-coach", 30, 2, true]]],
  ["Delta Tours", "M. Ilango", "thanjavur", ["tiruvarur", "nagapattinam", "mayiladuthurai", "tiruchirappalli"], "premium", true, 7700, "active", 110, "active", [["tempo-traveller", 14, 2, true], ["tourist-bus", 45, 2, true], ["tourist-coach", 35, 1, true]]],
  ["Big Temple Travels", "S. Babu", "thanjavur", ["tiruvarur"], "base", false, 7100, "expired", -12, "active", [["tempo-traveller", 12, 2, false]]],
  ["Hogenakkal Holidays", "D. Raja", "dharmapuri", ["krishnagiri", "salem", "tirupathur"], "premium", true, 7400, "active", 130, "active", [["tempo-traveller", 12, 2, true], ["tempo-traveller", 17, 1, true], ["tourist-coach", 30, 1, true]]],
  ["Thoppur Travels", "K. Murali", "dharmapuri", ["krishnagiri"], "base", false, 6900, "active", 70, "active", [["tempo-traveller", 14, 2, false]]],
  ["Bhavani Tours", "E. Sakthivel", "erode", ["coimbatore", "tiruppur", "salem"], "base", true, 7800, "active", 150, "active", [["tempo-traveller", 12, 2, true], ["tourist-bus", 49, 1, true]]],
  ["Kumari Coastal Travels", "J. Anto", "kanniyakumari", ["tirunelveli", "thoothukudi"], "premium", true, 8600, "active", 85, "active", [["tempo-traveller", 12, 3, true], ["urbania", 17, 1, true]]],
  ["Nellai Travels", "S. Subbiah", "tirunelveli", ["thoothukudi", "tenkasi", "kanniyakumari"], "base", true, 7900, "active", 6, "active", [["tempo-traveller", 14, 2, true], ["tourist-bus", 45, 1, true]]],
  ["Pearl City Tours", "A. Fernando", "thoothukudi", ["tirunelveli"], "base", false, null, "paused", 40, "paused", [["tempo-traveller", 12, 1, true]]],
  ["Vellore Fort Travels", "H. Basha", "vellore", ["ranipet", "tirupathur", "tiruvannamalai"], "base", true, 7300, "active", 200, "active", [["tempo-traveller", 12, 2, true], ["tourist-coach", 35, 1, true]]],
  ["Arunachala Tours", "P. Shiva", "tiruvannamalai", ["vellore", "viluppuram"], "premium", false, 7500, "trial", 14, "active", [["tempo-traveller", 14, 2, true]]],
  ["Pondy Shore Travels", "R. Arun", "viluppuram", ["cuddalore", "chengalpattu", "kallakurichi"], "base", false, 7600, "active", 120, "active", [["tempo-traveller", 12, 2, true], ["urbania", 13, 1, true]]],
  ["Kanchi Silk Travels", "B. Venkat", "kancheepuram", ["chennai", "chengalpattu", "vellore"], "base", false, 7400, "pending-payment", 0, "pending-verification", [["tempo-traveller", 12, 1, true]]],
  ["Hosur Highway Travels", "C. Prakash", "krishnagiri", ["dharmapuri"], "base", false, null, "trial", 20, "onboarding", [["tourist-bus", 49, 1, true]]],
  ["Rameswaram Pilgrim Travels", "T. Ramesh", "ramanathapuram", ["madurai", "sivaganga"], "base", false, 8000, "active", 60, "contacted", [["tempo-traveller", 12, 1, false]]],
];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

let phoneSeed = 70100;
export const seedOperators: Operator[] = OPS.map((o, i) => {
  const [name, contact, district, serves, plan, verified, price, sub, exp, status, fleet] = o;
  const total = fleet.reduce((s, f) => s + f[2], 0);
  const mob = `9${(phoneSeed + i * 137).toString().padStart(5, "0")}${(10000 + i * 731).toString().slice(-4)}`;
  return {
    id: `op-${slug(name)}`,
    name,
    contactPerson: contact,
    mobile: mob,
    whatsapp: mob,
    primaryDistrict: district,
    serviceAreas: serves,
    totalFleet: total,
    approxDailyPrice: price,
    plan,
    subscriptionStatus: sub,
    subscriptionStart: addDays(exp - 365),
    subscriptionExpiry: addDays(exp),
    visibilityOverride: "auto",
    verified,
    status,
    joinDate: addDays(-200 + i * 4),
    featured: false,
    internalNotes: i % 4 === 0 ? "Responsive on WhatsApp. Prefers calls after 10am." : "",
  };
});

const MODELS: Record<VehicleTypeId, string[]> = {
  "tempo-traveller": ["Force Tempo Traveller 3350", "Force Tempo Traveller 3700", "Force Traveller 26"],
  urbania: ["Force Urbania 3350", "Force Urbania 3615", "Force Urbania 4400"],
  "mini-bus": ["Eicher Skyline Pro", "Tata Starbus Mini"],
  "tourist-coach": ["Eicher Starline 2075", "Tata Starbus Ultra", "BharatBenz 914"],
  "tourist-bus": ["Ashok Leyland Viking", "BharatBenz 1624", "Volvo 9600 (Semi-sleeper)"],
};

export const seedVehicles: Vehicle[] = [];
OPS.forEach((o, i) => {
  const op = seedOperators[i];
  let n = 0;
  o[10].forEach(([type, seats, count, ac], fi) => {
    for (let c = 0; c < count; c++) {
      n++;
      const pal = ((i + fi + c) % 4) + 1;
      const alt = ((i + fi + c + 2) % 4) + 1;
      seedVehicles.push({
        id: `${op.id}-v${n}`,
        operatorId: op.id,
        type,
        model: MODELS[type][(i + c) % MODELS[type].length],
        seats,
        ac,
        district: op.primaryDistrict,
        serviceAreas: op.serviceAreas,
        photos: [
          `/img/vehicles/${type}-${pal}.svg`,
          `/img/vehicles/interior-${pal}.svg`,
          `/img/vehicles/${type}-${alt}.svg`,
        ],
        status: op.status === "active" ? (i === 4 && c === 0 ? "pending-review" : "active") : "draft",
        verified: op.verified,
        internalNotes: "",
      });
    }
  });
});

// Featured: must be Premium + Verified + Active + manually selected (max 4)
const FEATURED = [
  "op-sri-murugan-tours-travels",
  "op-kovai-kings-travels",
  "op-meenakshi-travels",
  "op-rockfort-travels",
];
seedOperators.forEach((op) => {
  if (FEATURED.includes(op.id)) op.featured = true;
});

export const seedSiteConfig: SiteConfig = {
  featuredOperatorIds: FEATURED,
  popularDistrictIds: ["chennai", "coimbatore", "madurai", "salem", "tiruchirappalli", "dharmapuri", "thanjavur", "kanniyakumari"],
  supportPhone: "+91 90000 00000",
  supportWhatsapp: "919000000000",
  supportEmail: "support@tourzin.com",
  businessHours: "Mon–Sat, 9:00 AM – 8:00 PM IST",
  planPricing: { base: null, premium: null },
  trialVisible: true,
};

export const seedStaff: StaffUser[] = [
  { id: "u-admin", name: "Tourzin Admin", email: "admin@tourzin.com", role: "admin", active: true },
  { id: "u-exec1", name: "Divya (Executive)", email: "exec@tourzin.com", role: "executive", active: true },
  { id: "u-exec2", name: "Karthi (Executive)", email: "exec2@tourzin.com", role: "executive", active: true },
];

// Demo-only credentials for mock mode. Firebase Auth replaces this entirely.
export const DEMO_PASSWORDS: Record<string, string> = {
  "admin@tourzin.com": "admin123",
  "exec@tourzin.com": "exec123",
  "exec2@tourzin.com": "exec123",
};

const at = (days: number, h = 10) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  d.setHours(h, 15, 0, 0);
  return d.toISOString();
};

export const seedEnquiries: Enquiry[] = [
  {
    id: "ENQ-1042", createdAt: at(0, 9), source: "web-form", sourceNote: "",
    district: "chennai", destination: "Pondicherry", travelDate: addDays(9), returnDate: addDays(10),
    passengers: 14, vehicleType: "tempo-traveller", acPreference: "ac", name: "Lakshmi Narayanan", mobile: "9840012345",
    additional: "Family trip, 2 senior citizens. Need pushback seats.", status: "new", assignedTo: "", followUpDate: addDays(0),
    matches: [], customerResponse: "", selectedOperatorId: "",
    activity: [{ at: at(0, 9), by: "System", text: "Enquiry submitted via Let Tourzin Help" }],
  },
  {
    id: "ENQ-1041", createdAt: at(-1, 18), source: "no-results", sourceNote: "No search results found",
    district: "ariyalur", destination: "Velankanni", travelDate: addDays(14), returnDate: "",
    passengers: 30, vehicleType: "tourist-coach", acPreference: "no-preference", name: "Joseph Raj", mobile: "9787012345",
    additional: "", status: "matching", assignedTo: "u-exec1", followUpDate: addDays(1),
    matches: [
      { operatorId: "op-rockfort-travels", availability: "pending", quote: "", inOptions: false, note: "" },
      { operatorId: "op-delta-tours", availability: "awaiting-response", quote: "", inOptions: false, note: "Called once" },
    ],
    customerResponse: "", selectedOperatorId: "",
    activity: [
      { at: at(-1, 18), by: "System", text: "Enquiry submitted from no-results search" },
      { at: at(0, 10), by: "Divya (Executive)", text: "Status → Matching. Shortlisted Trichy & Thanjavur operators." },
    ],
  },
  {
    id: "ENQ-1039", createdAt: at(-2, 11), source: "phone", sourceNote: "Phone call",
    district: "coimbatore", destination: "Ooty & Coonoor", travelDate: addDays(5), returnDate: addDays(7),
    passengers: 12, vehicleType: "any", acPreference: "no-preference", name: "Meera Krishnan", mobile: "9944012345",
    additional: "Corporate team, invoice needed", status: "options-sent", assignedTo: "u-exec1", followUpDate: addDays(0),
    matches: [
      { operatorId: "op-kovai-kings-travels", availability: "available", quote: "₹9,800/day incl. driver bata; toll extra", inOptions: true, note: "" },
      { operatorId: "op-nilgiri-trails", availability: "available", quote: "₹10,500/day all-inclusive except parking", inOptions: true, note: "" },
      { operatorId: "op-siruvani-tours", availability: "not-available", quote: "", inOptions: false, note: "Booked those dates" },
    ],
    customerResponse: "Reviewing with manager", selectedOperatorId: "",
    activity: [
      { at: at(-2, 11), by: "Divya (Executive)", text: "Created from phone call" },
      { at: at(-1, 15), by: "Divya (Executive)", text: "Shared 2 options on WhatsApp" },
    ],
  },
  {
    id: "ENQ-1035", createdAt: at(-5, 16), source: "web-form", sourceNote: "",
    district: "madurai", destination: "Rameswaram", travelDate: addDays(-1), returnDate: "",
    passengers: 45, vehicleType: "tourist-bus", acPreference: "ac", name: "Ganesan S", mobile: "9003012345",
    additional: "Temple trust group", status: "booked", assignedTo: "u-exec2", followUpDate: "",
    matches: [{ operatorId: "op-meenakshi-travels", availability: "available", quote: "₹24,000 trip total", inOptions: true, note: "" }],
    customerResponse: "Chose Meenakshi Travels", selectedOperatorId: "op-meenakshi-travels",
    activity: [{ at: at(-5, 16), by: "System", text: "Enquiry submitted" }, { at: at(-3, 12), by: "Karthi (Executive)", text: "Outcome: Booked" }],
  },
  {
    id: "ENQ-1033", createdAt: at(-6, 10), source: "web-form", sourceNote: "",
    district: "salem", destination: "Yercaud", travelDate: addDays(-3), returnDate: "",
    passengers: 10, vehicleType: "urbania", acPreference: "ac", name: "Priya Dharshini", mobile: "9876012345",
    additional: "", status: "not-booked", assignedTo: "u-exec2", followUpDate: "",
    matches: [{ operatorId: "op-yercaud-travels", availability: "available", quote: "₹8,200/day", inOptions: true, note: "" }],
    customerResponse: "Went with a relative's vehicle", selectedOperatorId: "",
    activity: [{ at: at(-6, 10), by: "System", text: "Enquiry submitted" }],
  },
  {
    id: "ENQ-1030", createdAt: at(-8, 13), source: "web-form", sourceNote: "",
    district: "tiruchirappalli", destination: "Navagraha temples", travelDate: addDays(3), returnDate: addDays(4),
    passengers: 17, vehicleType: "tempo-traveller", acPreference: "ac", name: "Ramya V", mobile: "9500012345",
    additional: "", status: "operator-connected", assignedTo: "u-exec1", followUpDate: addDays(2),
    matches: [{ operatorId: "op-rockfort-travels", availability: "available", quote: "₹8,300/day", inOptions: true, note: "" }],
    customerResponse: "Selected Rockfort", selectedOperatorId: "op-rockfort-travels",
    activity: [{ at: at(-8, 13), by: "System", text: "Enquiry submitted" }, { at: at(-2, 13), by: "Divya (Executive)", text: "Connected customer with Rockfort Travels" }],
  },
  {
    id: "ENQ-1028", createdAt: at(-9, 13), source: "web-form", sourceNote: "",
    district: "theni", destination: "Munnar", travelDate: addDays(6), returnDate: "",
    passengers: 25, vehicleType: "mini-bus", acPreference: "no-preference", name: "Arun P", mobile: "9600012345",
    additional: "", status: "no-supply", assignedTo: "u-exec2", followUpDate: "",
    matches: [], customerResponse: "", selectedOperatorId: "",
    activity: [{ at: at(-9, 13), by: "System", text: "Enquiry submitted" }],
  },
];

export const seedPayments: Payment[] = seedOperators
  .filter((o) => ["active", "expiring-soon", "expired"].includes(o.subscriptionStatus))
  .flatMap((o, i) => {
    const amount = o.plan === "premium" ? 6000 : 2500; // dummy figures only — plan pricing is not locked
    const p: Payment[] = [
      {
        id: `pay-${o.id}-1`, operatorId: o.id, amount, date: o.subscriptionStart,
        mode: (["upi", "bank-transfer", "cash"] as const)[i % 3], reference: `TXN${100230 + i}`,
        periodStart: o.subscriptionStart, periodEnd: o.subscriptionExpiry, plan: o.plan, renewal: i % 3 === 0,
      },
    ];
    return p;
  });

export const seedLeads: OperatorLead[] = [
  { id: "lead-1", createdAt: at(-1, 12), companyName: "Sathya Travels", contactPerson: "Sathya M", mobile: "9787654321", whatsapp: "9787654321", district: "karur", vehicleTypes: ["tempo-traveller"], fleetSize: "2–5", handled: false },
  { id: "lead-2", createdAt: at(-3, 17), companyName: "Annai Tours", contactPerson: "Mary A", mobile: "9443212345", whatsapp: "9443212345", district: "nagapattinam", vehicleTypes: ["tourist-coach", "tourist-bus"], fleetSize: "6–10", handled: true },
];

export const FAQS: FaqItem[] = [
  { group: "Using Tourzin", q: "What is Tourzin?", a: "Tourzin is a Tamil Nadu marketplace that helps you discover and compare tourist vehicle operators — Tempo Travellers, Urbanias, tourist coaches and tourist buses — and contact them directly by call or WhatsApp.", home: true },
  { group: "Using Tourzin", q: "Is Tourzin free for customers?", a: "Yes. Searching, comparing and contacting operators on Tourzin is free for customers. You don't need an account.", home: true },
  { group: "Vehicle Search", q: "How do I search for a vehicle?", a: "Choose your district, optionally pick a vehicle type and passenger count, and tap Search Vehicles. You'll see operators based in that district first, followed by operators who serve it." },
  { group: "Vehicle Search", q: "Which areas does Tourzin cover?", a: "Tourzin currently covers Tamil Nadu only. You can search across Tamil Nadu districts; availability of operators varies by district.", home: true },
  { group: "Operator Contact", q: "Does Tourzin book the vehicle for me?", a: "No. Tourzin helps you find and contact operators. The final quote, availability, booking confirmation and payment are agreed directly between you and the operator.", home: true },
  { group: "Operator Contact", q: "Why do I see a safety checklist before calling?", a: "Before you contact any operator, we show a short checklist of things to confirm — exact vehicle, final quote, extra charges, payment and cancellation terms — so you can book with confidence." },
  { group: "Pricing", q: "Are the prices shown final?", a: "No. Where shown, the approximate daily price is an indicative figure provided by the operator. The final quote depends on your route, days, season and inclusions — always confirm it directly with the operator.", home: true },
  { group: "Tourzin Verified", q: "What does Tourzin Verified mean?", a: "Tourzin Verified is shown only for operators who have completed Tourzin's formal verification process. It is a trust signal, not a guarantee of service — always confirm trip details in writing." },
  { group: "Let Tourzin Help", q: "What if I can't find a suitable vehicle?", a: "Use Let Tourzin Help. Share your trip details and a Tourzin executive will look for suitable operators and share options with you. There's no login and no obligation.", home: true },
  { group: "For Operators", q: "How can I list my vehicles on Tourzin?", a: "Fill in the Join Tourzin form on the For Operators page. Our team will contact you, collect your details and vehicle photos, and set up your listing." },
  { group: "Subscription/Joining", q: "Is there a fee for operators?", a: "Tourzin works on an operator subscription model with Base and Premium plans. Our team will share current plan details when you join." },
  { group: "Subscription/Joining", q: "What is the difference between Base and Premium?", a: "Both plans include a standard listing and direct customer enquiries. Premium gives stronger ranking priority in search and eligibility to be featured on the homepage." },
];

export const GUIDES: Guide[] = [
  {
    slug: "tempo-traveller-vs-urbania", title: "Tempo Traveller vs Urbania: Which Should You Book?", category: "Vehicle Guides",
    excerpt: "Comparing comfort, space and typical use cases so you can choose the right van for your group.", readMins: 5, featured: true,
    body: [
      { h: "Quick answer", p: ["For most family and temple trips, a Tempo Traveller offers great value and plenty of luggage space. If comfort, headroom and a smoother ride matter more — for corporate travel or long highway days — an Urbania is worth considering."] },
      { h: "Seating and space", p: ["Both vehicles are commonly available in roughly 9–17 seat configurations, but the exact layout varies by operator and model. Always confirm the exact seat count and whether the last row is a full seat or a jump seat."] },
      { h: "What to ask the operator", p: ["Ask for recent photos of the actual vehicle, AC condition, luggage space, driver details and whether toll, parking and driver bata are included in the quote."] },
    ],
  },
  {
    slug: "tourist-vehicle-rental-cost-tamil-nadu", title: "What Affects Tourist Vehicle Rental Prices in Tamil Nadu?", category: "Pricing Guides",
    excerpt: "Kilometres, days, season and inclusions — the factors that shape the final quote you receive.", readMins: 6, featured: true,
    body: [
      { h: "Per-day vs per-km", p: ["Operators may quote per day with a kilometre limit, per kilometre with a daily minimum, or as a fixed trip total. Ask which model applies and what happens if you exceed the limit."] },
      { h: "Hidden extras to check", p: ["Toll, parking, interstate permits, driver bata, night halt charges and hill-station charges are commonly billed separately. Ask for them in writing."] },
      { h: "Why prices vary", p: ["Season, wedding dates, festival weekends, vehicle age and AC all affect pricing. Tourzin shows only an approximate operator-provided daily figure where available — the final quote always comes from the operator."] },
    ],
  },
  {
    slug: "group-trip-planning-checklist", title: "Group Trip Planning Checklist for Tamil Nadu Tours", category: "Group Travel Planning",
    excerpt: "A practical checklist for planning temple tours, hill-station trips and family functions with a hired vehicle.", readMins: 4, featured: true,
    body: [
      { h: "Before you book", p: ["Fix your headcount, dates, pickup point and rough route. Decide whether you need AC and how much luggage the group will carry."] },
      { h: "When comparing operators", p: ["Compare at least two or three options. Confirm the exact vehicle, final quote, inclusions, payment terms and cancellation policy before paying any advance."] },
      { h: "On the day", p: ["Share the driver's number with the group, keep a copy of the written confirmation and agree on reporting time and halts in advance."] },
    ],
  },
  {
    slug: "how-to-choose-a-tourist-bus-operator", title: "How to Choose a Reliable Tourist Bus Operator", category: "Operator/Marketplace Guides",
    excerpt: "Signals of a trustworthy operator and the questions to ask before you pay an advance.", readMins: 5, featured: false,
    body: [
      { h: "Look for clear communication", p: ["Good operators share vehicle photos, a clear written quote and their terms without pressure."] },
      { h: "Verification", p: ["Tourzin Verified is shown only after formal verification by Tourzin. Even so, always confirm the details of your specific trip in writing."] },
    ],
  },
  {
    slug: "weekend-trips-from-chennai", title: "Weekend Group Trips from Chennai by Tempo Traveller", category: "District/Local Guides",
    excerpt: "Popular short trips from Chennai that work well for groups of 10–17 people.", readMins: 4, featured: false,
    body: [
      { h: "Short drives", p: ["Mahabalipuram, Pondicherry and Vedanthangal are popular one-day or overnight options for groups starting in Chennai."] },
      { h: "Planning tip", p: ["Weekend demand is high — contact operators early and confirm the vehicle and quote in writing."] },
    ],
  },
];

// Dummy analytics history so dashboards have something to show in demo mode.
import type { AnalyticsEvent } from "../types";
export const seedEvents: AnalyticsEvent[] = (() => {
  const out: AnalyticsEvent[] = [];
  let r = 7;
  const rnd = () => ((r = (r * 9301 + 49297) % 233280), r / 233280);
  const listed = seedOperators.filter((o) => o.status === "active");
  for (let d = 29; d >= 0; d--) {
    const day = new Date(today);
    day.setDate(day.getDate() - d);
    const searches = 8 + Math.floor(rnd() * 14);
    for (let s = 0; s < searches; s++) {
      const at = new Date(day);
      at.setHours(8 + Math.floor(rnd() * 13), Math.floor(rnd() * 60));
      const op = listed[Math.floor(rnd() * listed.length)];
      const district = op.primaryDistrict;
      const t = at.toISOString();
      out.push({ name: "homepage_search_started", at: t, props: {} });
      out.push({ name: "search_completed", at: t, props: { district, results: 3 } });
      if (rnd() < 0.12) { out.push({ name: "no_results_search", at: t, props: { district: "ariyalur" } }); continue; }
      out.push({ name: "search_results_viewed", at: t, props: { district } });
      out.push({ name: "operator_card_impression", at: t, props: { operator_id: op.id, district } });
      if (rnd() < 0.45) {
        const mode = rnd() < 0.55 ? "whatsapp" : "call";
        out.push({ name: "contact_clicked", at: t, props: { operator_id: op.id, mode, district } });
        out.push({ name: "safety_checklist_shown", at: t, props: { operator_id: op.id, mode } });
        if (rnd() < 0.85) {
          out.push({ name: "safety_checklist_accepted", at: t, props: { operator_id: op.id, mode } });
          if (mode === "whatsapp") out.push({ name: "whatsapp_opened", at: t, props: { operator_id: op.id, district } });
          else {
            out.push({ name: "number_revealed", at: t, props: { operator_id: op.id, district } });
            if (rnd() < 0.7) out.push({ name: "call_now_clicked", at: t, props: { operator_id: op.id, district } });
          }
        }
      }
      if (rnd() < 0.05) out.push({ name: "help_form_submitted", at: t, props: { district } });
    }
  }
  return out;
})();

// A few renewals this month so the revenue / renewal KPIs show demo values.
["op-kovai-kings-travels", "op-yercaud-travels", "op-vellore-fort-travels"].forEach((oid, i) => {
  const o = seedOperators.find((x) => x.id === oid)!;
  seedPayments.push({
    id: `pay-${oid}-renew`, operatorId: oid, amount: o.plan === "premium" ? 6000 : 2500, date: addDays(-i * 3),
    mode: "upi", reference: `UPI${880100 + i}`, periodStart: o.subscriptionStart, periodEnd: o.subscriptionExpiry, plan: o.plan, renewal: true,
  });
});
