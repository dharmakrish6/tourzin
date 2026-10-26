"use client";
// Homepage blocks driven by Admin → Homepage Config (featured operators, popular districts).
import Link from "next/link";
import { useState } from "react";
import { track } from "@/lib/analytics";
import { districtById } from "@/lib/constants";
import { db } from "@/lib/data";
import { seedSiteConfig } from "@/lib/data/seed";
import { useAsync } from "@/lib/hooks";
import { isFeaturedEligible, whatsappMessage } from "@/lib/search";
import { IconArrowRight, IconPin } from "../Icons";
import { OperatorCard, SkeletonCard } from "../OperatorCard";
import { SafetyModal, type ContactTarget } from "../SafetyModal";

export function PopularDistricts() {
  const { data } = useAsync(async () => {
    const [cfg, districts] = await Promise.all([db.getSiteConfig(), db.listDistricts()]);
    return { cfg, districts };
  });
  const ids = data?.cfg.popularDistrictIds ?? seedSiteConfig.popularDistrictIds;
  const list = ids
    .map((id) => data?.districts.find((d) => d.id === id) ?? districtById(id))
    .filter(Boolean) as NonNullable<ReturnType<typeof districtById>>[];

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {list.map((d, i) => (
        <li key={d.id}>
          <Link
            href={d.approvedPage ? `/locations/${d.id}/` : `/search/results/?district=${d.id}`}
            onClick={() => track("district_cta_clicked", { district: d.id, source: "homepage_popular" })}
            className={`card card-hover group flex h-full items-center justify-between gap-3 p-4 ${i < 2 ? "sm:bg-gradient-to-br sm:from-blue-50 sm:to-white" : ""}`}
          >
            <span>
              <span className="flex items-center gap-1.5 font-semibold text-navy">
                <IconPin size={16} className="text-orange" /> {d.name}
              </span>
              <span className="mt-0.5 block text-xs text-muted">{d.approvedPage ? "District guide & vehicles" : "Search vehicles"}</span>
            </span>
            <IconArrowRight size={18} className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-blue" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function FeaturedOperators() {
  const [target, setTarget] = useState<ContactTarget | null>(null);
  const { data, loading } = useAsync(async () => {
    const [cfg, ops, vehicles] = await Promise.all([db.getSiteConfig(), db.listOperators(), db.listVehicles()]);
    // Featured = Premium + Verified + Active + manually selected (max 4)
    const featured = cfg.featuredOperatorIds
      .map((id) => ops.find((o) => o.id === id))
      .filter((o): o is NonNullable<typeof o> => !!o && isFeaturedEligible(o, vehicles, cfg))
      .slice(0, 4)
      .map((op) => {
        const vs = vehicles.filter((v) => v.operatorId === op.id && v.status === "active");
        const a = vs[0], b = vs[1] ?? vs[0];
        return { op, photos: [a.photos[0], a.photos[1], b.photos[2]] };
      });
    return featured;
  });

  if (loading)
    return (
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}
      </div>
    );
  if (!data?.length) return <p className="text-muted">Featured operators will appear here soon.</p>;

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {data.map(({ op, photos }, i) => (
          <OperatorCard
            key={op.id}
            operator={op}
            photos={photos}
            context={{ district: op.primaryDistrict, section: "featured", position: i + 1 }}
            onContact={(mode) => {
              track("featured_operator_clicked", { operator_id: op.id, mode });
              setTarget({
                mode,
                operatorId: op.id,
                operatorName: op.name,
                phone: op.mobile,
                whatsapp: op.whatsapp,
                district: op.primaryDistrict,
                message: whatsappMessage(op.name, { district: districtById(op.primaryDistrict)?.name ?? "" }),
              });
            }}
          />
        ))}
      </div>
      {target && <SafetyModal target={target} onClose={() => setTarget(null)} />}
    </>
  );
}
