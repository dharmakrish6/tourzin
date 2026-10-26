# Tourzin — MVP Web App

Tamil Nadu tourist-vehicle marketplace, built from **Tourzin MVP Master Product & Developer Specification v1.0**.
Next.js 16 (App Router) + TypeScript + Tailwind CSS v4, exported as a **static site** (`out/`) for Hostinger / cPanel.

Runs today on **dummy data** (stored in the browser). Swapping to **Firebase** later is a config change — no page changes.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # static export → out/
npm start            # preview out/ locally
```

### Demo logins (mock mode)
| Role | Email | Password |
|---|---|---|
| Admin | admin@tourzin.com | admin123 |
| Executive | exec@tourzin.com | exec123 |

Staff sign-in is at **/admin/login/**. A "Reset demo data" link in the dashboards restores the seed.

---

## What's built

**Public site**
- Home — search-first hero (District required, Vehicle Type & Passengers optional), trust cards, 5 vehicle types (Mini Bus = *coming soon*), popular districts, Let Tourzin Help, How it works, 4 Featured Operators, FAQ, Guides
- Search → Results — operator-first; *Operators in [District]* then *Operators serving [District]*; ranking Premium+Verified → Premium → Verified Base → Base, then type relevance → passenger suitability → completeness; price never affects ranking; Sort (Recommended / Most Vehicles); sticky desktop filter bar, mobile bottom-sheet; 6 + Load More per section; skeletons, retry, no-results flow
- Operator card exactly per §7.5 (no whole-card click, equal Call/WhatsApp, optional approx. price + disclaimer)
- **Safety checklist every time** before Call/WhatsApp; Call → number reveal + Call Now / Copy Number; WhatsApp → prefilled search-context message
- Let Tourzin Help (prefilled from no-results with internal source note), For Operators + Join form, About, Contact, FAQ (grouped), Guides + articles, vehicle category pages, Locations hub + approved district pages, Privacy / Terms / Marketplace Disclaimer, cookie notice, 404
- SEO: unique titles/descriptions, canonicals, breadcrumbs + JSON-LD, FAQ schema only for visible FAQs, results noindex, `sitemap.xml` (indexable pages only), `robots.txt`

**Executive Dashboard** (`/executive/`) — home with pipeline + follow-ups, inbox with filters, manual enquiry creation, enquiry detail with the locked 8-stage pipeline + Booked/Not Booked + exceptions, matching with suggested operators, availability statuses, operator quotes, options builder (WhatsApp-ready text), customer response, operator connected, notes & activity log, reports.

**Admin Panel** (`/admin/`) — KPI dashboard (§14), 7-day expiry reminders, sortable operator performance; Operators (status, verification, plan, subscription dates, visibility override, featured eligibility, service areas, payments); Vehicles (3-photo activation rule, image validation); Operator Leads → convert to operator; Subscriptions; Payments (manual, CSV export); Districts; Homepage & Settings (featured ×4, popular districts, plan pricing TBD, trial visibility); Enquiries; Contact Messages; Content/SEO inventory; Analytics reports; Users & Roles.

**Analytics** — all §14 event names in `src/lib/analytics.ts`, stored via the data layer and sent to GA4 when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set.

---

## Project structure

```
src/
  app/
    (site)/            public pages (header + footer layout)
    admin/login/       staff sign-in
    admin/(panel)/     admin pages (role: admin)
    executive/(desk)/  executive pages (roles: executive, admin)
    sitemap.ts robots.ts not-found.tsx
  components/          UI, forms, search, staff dashboards
  lib/
    types.ts           data model (spec §12)
    constants.ts       vehicle categories, districts, status labels
    search.ts          visibility + ranking rules (pure functions)
    analytics.ts       event tracking
    data/
      repository.ts    the data contract the UI uses
      mock.ts          dummy-data implementation (default)
      firebase.ts      Firebase implementation (commented, ready to enable)
      seed.ts          dummy operators, vehicles, enquiries, payments, FAQs, guides
firebase/firestore.rules
public/img/vehicles/   placeholder vehicle illustrations (replace with real photos)
scripts/gen-placeholder-images.mjs
```

---

## Moving to Firebase

1. `npm install firebase`
2. Copy `.env.example` → `.env.local`, fill `NEXT_PUBLIC_FIREBASE_*`, set `NEXT_PUBLIC_DATA_SOURCE=firebase`
3. In `src/lib/data/firebase.ts`, delete the placeholder `Proxy` export and uncomment the implementation below it
4. Firebase console: enable **Email/Password** auth; create staff users; for each add `staff/{uid}` = `{ name, email, role: "admin" | "executive", active: true }`
5. Deploy rules: `firebase deploy --only firestore:rules` (file: `firebase/firestore.rules`)
6. Import starting data into collections `operators, vehicles, districts, config/site, payments` (same shapes as `seed.ts`), or start empty
7. Image pipeline (§11): upload originals to Storage; add a Cloud Function (e.g. `sharp`) to create S/M/L WebP renditions, smart crop and the bottom-right public watermark

Before launch: move `internalNotes` and other private operator fields to a staff-only sub-collection (public reads currently include them — noted in the rules file).

## Deploying to Hostinger
`npm run build`, then upload the **contents** of `out/` to `public_html/`. `.htaccess` is included for trailing-slash URLs and the 404 page.

## Notes
- All operator names, numbers and prices are fictional demo data.
- Plan pricing is intentionally not hard-coded (configurable in Admin).
- Legal page copy is placeholder text pending legal review.
