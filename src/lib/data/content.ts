// Static site content (FAQs, guides) and default site settings.
// Marketplace data (operators, vehicles, districts, enquiries…) lives in Firestore — see ./firebase.ts.

import type { FaqItem, Guide, SiteConfig } from "../types";

// Fallback for pages rendered at build time; the live values are Firestore config/site (Admin → Homepage).
export const DEFAULT_SITE_CONFIG: SiteConfig = {
  featuredOperatorIds: [],
  popularDistrictIds: ["chennai", "coimbatore", "madurai", "salem", "tiruchirappalli", "dharmapuri", "thanjavur", "kanniyakumari"],
  supportPhone: "+91 90000 00000",
  supportWhatsapp: "919000000000",
  supportEmail: "support@tourzin.com",
  businessHours: "Mon–Sat, 9:00 AM – 8:00 PM IST",
  planPricing: { base: null, premium: null },
  trialVisible: true,
};

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
