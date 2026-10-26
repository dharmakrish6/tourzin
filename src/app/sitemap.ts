import type { MetadataRoute } from "next";
import { DISTRICTS, SITE, VEHICLE_CATEGORIES } from "@/lib/constants";
import { GUIDES } from "@/lib/data/seed";

export const dynamic = "force-static";

// Only live, canonical, indexable pages (spec §15). Search/results/admin are excluded.
export default function sitemap(): MetadataRoute.Sitemap {
  const u = (p: string) => `${SITE.url}${p}`;
  const now = new Date();
  return [
    "/", "/let-tourzin-help/", "/for-operators/", "/about/", "/contact/", "/faq/", "/guides/", "/locations/",
    "/privacy/", "/terms/", "/marketplace-disclaimer/",
    ...VEHICLE_CATEGORIES.filter((c) => c.live).map((c) => `/vehicles/${c.id}/`),
    ...DISTRICTS.filter((d) => d.approvedPage).map((d) => `/locations/${d.id}/`),
    ...GUIDES.map((g) => `/guides/${g.slug}/`),
  ].map((p) => ({ url: u(p), lastModified: now }));
}
