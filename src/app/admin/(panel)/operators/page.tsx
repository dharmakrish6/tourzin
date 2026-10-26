"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Empty, fmtDate, Loading, Pill, toneFor } from "@/components/staff/kit";
import { PageTitle } from "@/components/staff/StaffShell";
import { VerifiedBadge } from "@/components/ui";
import { districtName, DISTRICTS, OPERATOR_STATUS_LABEL, SUBSCRIPTION_STATUS_LABEL } from "@/lib/constants";
import { db } from "@/lib/data";
import { useAsync } from "@/lib/hooks";
import { effectiveSubscription, isPubliclyListed } from "@/lib/search";

export default function OperatorsPage() {
  const { data, loading } = useAsync(async () => {
    const [ops, vehicles, cfg] = await Promise.all([db.listOperators(), db.listVehicles(), db.getSiteConfig()]);
    return { ops, vehicles, cfg };
  });
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [plan, setPlan] = useState("");
  const [district, setDistrict] = useState("");
  const [verified, setVerified] = useState("");

  const rows = useMemo(() => {
    if (!data) return [];
    const t = q.toLowerCase();
    return data.ops
      .filter((o) => (!t || [o.name, o.contactPerson, o.mobile].some((x) => x.toLowerCase().includes(t))) && (!status || o.status === status) && (!plan || o.plan === plan) && (!district || o.primaryDistrict === district) && (!verified || String(o.verified) === verified))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data, q, status, plan, district, verified]);

  if (loading || !data) return <Loading />;

  return (
    <>
      <PageTitle title="Operators" sub={`${data.ops.length} operators`} actions={<Link href="/admin/operators/edit/?id=new" className="btn btn-primary btn-sm">+ Add operator</Link>} />
      <div className="mb-4 flex flex-wrap gap-2">
        <input className="input dash w-60" placeholder="Search name, contact, mobile" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search operators" />
        <select className="input dash w-auto" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status"><option value="">All statuses</option>{Object.entries(OPERATOR_STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <select className="input dash w-auto" value={plan} onChange={(e) => setPlan(e.target.value)} aria-label="Plan"><option value="">All plans</option><option value="base">Base</option><option value="premium">Premium</option></select>
        <select className="input dash w-auto" value={verified} onChange={(e) => setVerified(e.target.value)} aria-label="Verification"><option value="">Verified: any</option><option value="true">Verified</option><option value="false">Not verified</option></select>
        <select className="input dash w-auto" value={district} onChange={(e) => setDistrict(e.target.value)} aria-label="District"><option value="">All districts</option>{DISTRICTS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
      </div>
      {rows.length ? (
        <div className="card overflow-x-auto">
          <table className="tbl min-w-[1000px]">
            <thead><tr><th>Operator</th><th>District</th><th>Fleet</th><th>Plan</th><th>Subscription</th><th>Expiry</th><th>Status</th><th>Public</th></tr></thead>
            <tbody>
              {rows.map((o) => {
                const sub = effectiveSubscription(o);
                const listed = isPubliclyListed(o, data.vehicles, data.cfg);
                return (
                  <tr key={o.id}>
                    <td>
                      <Link href={`/admin/operators/edit/?id=${o.id}`} className="font-semibold text-blue hover:underline">{o.name}</Link>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted">{o.contactPerson} · {o.mobile} {o.verified && <VerifiedBadge small />} {o.featured && <Pill tone="orange">Featured</Pill>}</div>
                    </td>
                    <td>{districtName(o.primaryDistrict)}<div className="text-xs text-muted">+{o.serviceAreas.length} service areas</div></td>
                    <td className="tabular-nums">{o.totalFleet}</td>
                    <td><Pill tone={o.plan === "premium" ? "navy" : "gray"}>{o.plan}</Pill></td>
                    <td><Pill tone={toneFor(sub)}>{SUBSCRIPTION_STATUS_LABEL[sub]}</Pill>{o.visibilityOverride !== "auto" && <div className="mt-1 text-xs text-orange-600">Override: {o.visibilityOverride}</div>}</td>
                    <td className="whitespace-nowrap text-muted">{fmtDate(o.subscriptionExpiry)}</td>
                    <td><Pill tone={toneFor(o.status)}>{OPERATOR_STATUS_LABEL[o.status]}</Pill></td>
                    <td>{listed ? <Pill tone="green">Visible</Pill> : <Pill tone="gray">Hidden</Pill>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>No operators match these filters.</Empty>
      )}
    </>
  );
}
