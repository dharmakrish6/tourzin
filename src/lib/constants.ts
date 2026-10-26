import type {
  AvailabilityStatus,
  District,
  EnquiryStatus,
  OperatorStatus,
  SubscriptionStatus,
  VehicleCategory,
  VehicleStatus,
} from "./types";

export const SITE = {
  name: "Tourzin",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://tourzin.com",
  tagline: "Tamil Nadu's tourist vehicle marketplace",
};

export const VEHICLE_CATEGORIES: VehicleCategory[] = [
  {
    id: "tempo-traveller",
    name: "Tempo Traveller",
    shortName: "Tempo Traveller",
    seatRange: "Approx. 12–17 seats",
    minSeats: 12,
    maxSeats: 17,
    live: true,
    color: "#1769AA",
    blurb:
      "The go-to choice for family trips, temple tours and small office outings. Comfortable pushback seats and plenty of luggage room for mid-sized groups.",
    useCases: ["Family trips & temple tours", "Hill station getaways", "Wedding guest transfers", "Small corporate outings"],
  },
  {
    id: "urbania",
    name: "Urbania",
    shortName: "Urbania",
    seatRange: "Approx. 9–17 seats",
    minSeats: 9,
    maxSeats: 17,
    live: true,
    color: "#0B2744",
    blurb:
      "A premium van with a modern cabin, more headroom and a smoother ride. Popular for corporate travel and comfort-focused family trips.",
    useCases: ["Corporate & client travel", "Premium family holidays", "Airport group transfers", "Long-distance comfort trips"],
  },
  {
    id: "mini-bus",
    name: "Mini Bus",
    shortName: "Mini Bus",
    seatRange: "Approx. 20–30 seats",
    minSeats: 20,
    maxSeats: 30,
    live: false, // APPROVED / PLANNED — must not be described as LIVE until launched
    color: "#F47A20",
    blurb:
      "For groups that are too big for a van but don't need a full coach. Coming soon to Tourzin.",
    useCases: ["School & college trips", "Extended family functions", "Pilgrimage groups", "Staff transport"],
  },
  {
    id: "tourist-coach",
    name: "Tourist Coach",
    shortName: "Coach",
    seatRange: "Approx. 27–35+ seats",
    minSeats: 27,
    maxSeats: 40,
    live: true,
    color: "#2E7D32",
    blurb:
      "Mid-to-large tourist coaches with reclining seats and music systems — well suited to multi-day tours and group pilgrimages.",
    useCases: ["Multi-day tours", "Pilgrimage circuits", "College industrial visits", "Association trips"],
  },
  {
    id: "tourist-bus",
    name: "Tourist Bus",
    shortName: "Bus",
    seatRange: "Approx. 36–50+ seats",
    minSeats: 36,
    maxSeats: 60,
    live: true,
    color: "#7A3E9D",
    blurb:
      "Full-size tourist buses for large groups — weddings, company events, school trips and big pilgrimages.",
    useCases: ["Large wedding parties", "Company annual trips", "School excursions", "Big pilgrimage groups"],
  },
];

export const LIVE_CATEGORIES = VEHICLE_CATEGORIES.filter((c) => c.live);
export const categoryById = (id: string) => VEHICLE_CATEGORIES.find((c) => c.id === id);

// Tamil Nadu districts (MVP geography: Tamil Nadu only)
const D = (
  name: string,
  opts: Partial<District> = {}
): District => ({
  id: name.toLowerCase().replace(/[^a-z]+/g, "-").replace(/(^-|-$)/g, ""),
  name,
  approvedPage: false,
  popular: false,
  ...opts,
});

export const DISTRICTS: District[] = [
  D("Ariyalur"),
  D("Chengalpattu"),
  D("Chennai", {
    approvedPage: true,
    popular: true,
    intro:
      "Chennai is Tamil Nadu's largest source of group travel demand — from weekend trips to Mahabalipuram and Pondicherry to long tours across the state. Operators here run a wide mix of Tempo Travellers, Urbanias and full-size tourist buses.",
    highlights: ["Airport and railway station group pickups", "Weekend trips to Mahabalipuram & Pondicherry", "Corporate offsites along ECR and OMR"],
  }),
  D("Coimbatore", {
    approvedPage: true,
    popular: true,
    intro:
      "Coimbatore is the gateway to Ooty, Valparai and the Western Ghats. Tourist vehicles from Coimbatore are frequently booked for hill-station trips, Isha Yoga Center visits and Kerala border tours.",
    highlights: ["Ooty, Kodaikanal and Valparai trips", "Isha Yoga Center & Marudhamalai visits", "Corporate and college group travel"],
  }),
  D("Cuddalore"),
  D("Dharmapuri", { approvedPage: true, popular: true, intro: "Dharmapuri operators commonly serve Hogenakkal falls trips, Bengaluru transfers and pilgrimages across northern Tamil Nadu.", highlights: ["Hogenakkal Falls day trips", "Bengaluru group transfers", "Temple tours across North TN"] }),
  D("Dindigul", { popular: true }),
  D("Erode", { approvedPage: true, intro: "Erode operators serve textile-trade travel, Bhavani Sagar outings and hill trips toward Sathyamangalam and Ooty.", highlights: ["Bhavani Sagar & Kodiveri trips", "Ooty via Sathyamangalam", "Business group travel"] }),
  D("Kallakurichi"),
  D("Kancheepuram"),
  D("Kanniyakumari", { popular: true }),
  D("Karur"),
  D("Krishnagiri"),
  D("Madurai", {
    approvedPage: true,
    popular: true,
    intro:
      "Madurai is a hub for temple tours across southern Tamil Nadu. Operators here regularly cover Rameswaram, Kodaikanal, Kanyakumari and the Navagraha circuits.",
    highlights: ["Meenakshi Amman & Rameswaram tours", "Kodaikanal hill trips", "South TN pilgrimage circuits"],
  }),
  D("Mayiladuthurai"),
  D("Nagapattinam"),
  D("Namakkal"),
  D("Nilgiris", { popular: true }),
  D("Perambalur"),
  D("Pudukkottai"),
  D("Ramanathapuram"),
  D("Ranipet"),
  D("Salem", {
    approvedPage: true,
    popular: true,
    intro:
      "Salem sits at the centre of Tamil Nadu's road network, making it a strong base for tourist vehicles heading to Yercaud, Kolli Hills and destinations across the state.",
    highlights: ["Yercaud & Kolli Hills trips", "Central TN pilgrimage tours", "Wedding transfers across the region"],
  }),
  D("Sivaganga"),
  D("Tenkasi"),
  D("Thanjavur", { popular: true }),
  D("Theni"),
  D("Thoothukudi"),
  D("Tiruchirappalli", {
    approvedPage: true,
    popular: true,
    intro:
      "Trichy operators are popular for Srirangam, Samayapuram and Navagraha temple tours, as well as college and corporate group travel across the delta region.",
    highlights: ["Srirangam & Samayapuram temple tours", "Navagraha circuit", "Delta region group trips"],
  }),
  D("Tirunelveli", { popular: true }),
  D("Tirupathur"),
  D("Tiruppur"),
  D("Tiruvallur"),
  D("Tiruvannamalai"),
  D("Tiruvarur"),
  D("Vellore"),
  D("Viluppuram"),
  D("Virudhunagar"),
];

export const districtById = (id: string) => DISTRICTS.find((d) => d.id === id);
export const districtName = (id: string) => districtById(id)?.name ?? id;

export const OPERATOR_STATUS_LABEL: Record<OperatorStatus, string> = {
  "new-lead": "New Lead",
  contacted: "Contacted",
  onboarding: "Onboarding",
  "pending-verification": "Pending Verification",
  active: "Active",
  paused: "Paused",
  rejected: "Rejected",
};

export const SUBSCRIPTION_STATUS_LABEL: Record<SubscriptionStatus, string> = {
  trial: "Trial",
  "pending-payment": "Pending Payment",
  active: "Active",
  "expiring-soon": "Expiring Soon",
  expired: "Expired",
  paused: "Paused / Suspended",
  cancelled: "Cancelled",
};

export const VEHICLE_STATUS_LABEL: Record<VehicleStatus, string> = {
  draft: "Draft",
  "pending-review": "Pending Review",
  active: "Active",
  paused: "Paused",
  rejected: "Rejected / Removed",
};

export const PIPELINE: EnquiryStatus[] = [
  "new",
  "requirement-review",
  "matching",
  "checking-availability",
  "options-ready",
  "options-sent",
  "customer-reviewing",
  "operator-connected",
];
export const OUTCOMES: EnquiryStatus[] = ["booked", "not-booked"];
export const EXCEPTIONS: EnquiryStatus[] = [
  "no-supply",
  "customer-unresponsive",
  "operator-unresponsive",
  "cancelled",
  "invalid",
];

export const ENQUIRY_STATUS_LABEL: Record<EnquiryStatus, string> = {
  new: "New",
  "requirement-review": "Requirement Review",
  matching: "Matching",
  "checking-availability": "Checking Availability",
  "options-ready": "Options Ready",
  "options-sent": "Options Sent",
  "customer-reviewing": "Customer Reviewing",
  "operator-connected": "Operator Connected",
  booked: "Booked",
  "not-booked": "Not Booked",
  "no-supply": "No Supply",
  "customer-unresponsive": "Customer Unresponsive",
  "operator-unresponsive": "Operator Unresponsive",
  cancelled: "Cancelled",
  invalid: "Invalid",
};

export const AVAILABILITY_LABEL: Record<AvailabilityStatus, string> = {
  pending: "Pending",
  available: "Available",
  "not-available": "Not Available",
  tentative: "Tentatively Available",
  "awaiting-response": "Awaiting Operator Response",
  "alternative-offered": "Alternative Vehicle Offered",
};

export const SAFETY_CHECKLIST = [
  "Exact vehicle and seating capacity",
  "Travel date and availability",
  "Final quote for the full trip",
  "What is included and excluded",
  "Toll, parking, permit and driver charges",
  "Payment terms and advance amount",
  "Cancellation and refund terms",
  "Pickup point and reporting time",
  "Operator, vehicle and driver details",
  "Written confirmation (WhatsApp / SMS / email)",
];
