"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { categoryById, districtName, VEHICLE_CATEGORIES, VEHICLE_STATUS_LABEL } from "@/lib/constants";
import { db } from "@/lib/data";
import { useAsync } from "@/lib/hooks";
import { Empty, Loading, Pill, toneFor } from "./kit";
import { PageTitle } from "./StaffShell";

export function VehicleList() {
  const sp = useSearchParams();
  const { data, loading } = useAsync(async () => {
    const [vs, ops] = await Promise.all([db.listVehicles(), db.listOperators()]);
    return { vs, ops };
  });
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState(sp.get("status") ?? "");
  const rows = useMemo(() => {
    if (!data) return [];
    const t = q.toLowerCase();
    return data.vs.filter((v) => {
      const op = data.ops.find((o) => o.id === v.operatorId);
      return (!t || v.model.toLowerCase().includes(t) || op?.name.toLowerCase().includes(t)) && (!type || v.type === type) && (!status || v.status === status);
    });
  }, [data, q, type, status]);
  if (loading || !data) return <Loading />;

  return (
    <>
      <PageTitle title="Vehicles" sub={`${data.vs.length} vehicles · ${data.vs.filter((v) => v.status === "active").length} active`} actions={<Link href="/admin/vehicles/edit/?id=new" className="btn btn-primary btn-sm">+ Add vehicle</Link>} />
      <div className="mb-4 flex flex-wrap gap-2">
        <input className="input dash w-60" placeholder="Search model or operator" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search vehicles" />
        <select className="input dash w-auto" value={type} onChange={(e) => setType(e.target.value)} aria-label="Type"><option value="">All types</option>{VEHICLE_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <select className="input dash w-auto" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status"><option value="">All statuses</option>{Object.entries(VEHICLE_STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <span className="ml-auto self-center text-sm text-muted">{rows.length} shown</span>
      </div>
      {rows.length ? (
        <div className="card overflow-x-auto">
          <table className="tbl min-w-[900px]">
            <thead><tr><th></th><th>Vehicle</th><th>Operator</th><th>Seats</th><th>AC</th><th>Photos</th><th>Verified</th><th>Status</th></tr></thead>
            <tbody>
              {rows.map((v) => {
                const op = data.ops.find((o) => o.id === v.operatorId);
                return (
                  <tr key={v.id}>
                    <td className="w-20"><img src={v.photos[0]} alt="" className="h-10 w-16 rounded object-cover" loading="lazy" /></td>
                    <td><Link href={`/admin/vehicles/edit/?id=${v.id}`} className="font-medium text-blue hover:underline">{v.model}</Link><div className="text-xs text-muted">{categoryById(v.type)?.name}</div></td>
                    <td>{op?.name}<div className="text-xs text-muted">{districtName(v.district)}</div></td>
                    <td>{v.seats}</td>
                    <td>{v.ac ? "AC" : "Non-AC"}</td>
                    <td className={v.photos.length < 3 ? "font-semibold text-red-700" : ""}>{v.photos.length}</td>
                    <td>{v.verified ? <Pill tone="green">Yes</Pill> : <span className="text-muted">—</span>}</td>
                    <td><Pill tone={toneFor(v.status)}>{VEHICLE_STATUS_LABEL[v.status]}</Pill></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : <Empty>No vehicles match.</Empty>}
    </>
  );
}
