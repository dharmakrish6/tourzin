"use client";
import Link from "next/link";
import { track } from "@/lib/analytics";
import { categoryById } from "@/lib/constants";
import { db } from "@/lib/data";
import { useAsync } from "@/lib/hooks";
import { isPubliclyListed } from "@/lib/search";
import type { VehicleTypeId } from "@/lib/types";
import { IconArrowRight, IconUsers } from "./Icons";

/** Only vehicle categories with active supply in this district (spec §15.2). */
export function DistrictSupply({ district, districtName }: { district: string; districtName: string }) {
  const { data, loading } = useAsync(async () => {
    const [ops, vs, cfg] = await Promise.all([db.listOperators(), db.listVehicles(), db.getSiteConfig()]);
    const visible = new Set(
      ops.filter((o) => (o.primaryDistrict === district || o.serviceAreas.includes(district)) && isPubliclyListed(o, vs, cfg)).map((o) => o.id)
    );
    const types = new Set<VehicleTypeId>();
    vs.forEach((v) => visible.has(v.operatorId) && v.status === "active" && categoryById(v.type)?.live && types.add(v.type));
    return [...types];
  }, [district]);

  if (loading) return <div className="grid gap-3 sm:grid-cols-2">{[0, 1].map((i) => <div key={i} className="skeleton h-20" />)}</div>;
  if (!data?.length) return <p className="text-muted">Operators for {districtName} are being onboarded.</p>;
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {data.map((t) => {
        const c = categoryById(t)!;
        return (
          <li key={t}>
            <Link
              href={`/search/results/?district=${district}&type=${t}`}
              onClick={() => track("district_cta_clicked", { district, vehicle_type: t })}
              className="card card-hover flex items-center justify-between gap-3 p-4"
            >
              <span>
                <span className="block font-semibold text-navy">{c.name} in {districtName}</span>
                <span className="flex items-center gap-1 text-sm text-muted"><IconUsers size={14} /> {c.seatRange}</span>
              </span>
              <IconArrowRight size={18} className="text-blue" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
