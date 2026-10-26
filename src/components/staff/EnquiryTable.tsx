"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { categoryById, districtName, ENQUIRY_STATUS_LABEL, EXCEPTIONS, OUTCOMES, PIPELINE } from "@/lib/constants";
import { db } from "@/lib/data";
import { useAsync } from "@/lib/hooks";
import type { EnquiryStatus } from "@/lib/types";
import { Empty, fmtDate, fmtDateTime, Loading, Pill, toneFor } from "./kit";
import { PageTitle } from "./StaffShell";

export function EnquiryTable({ title, sub, defaultScope, detailBase }: { title: string; sub: string; defaultScope: "active" | "all"; detailBase: string }) {
  const sp = useSearchParams();
  const router = useRouter();
  const { data, loading } = useAsync(async () => {
    const [enq, staff] = await Promise.all([db.listEnquiries(), db.listStaff()]);
    return { enq, staff };
  });
  const [q, setQ] = useState("");
  const status = (sp.get("status") ?? "") as EnquiryStatus | "";
  const [scope, setScope] = useState<"active" | "all" | "closed">(status ? "all" : defaultScope);
  const [source, setSource] = useState("");
  const today = new Date().toISOString().slice(0, 10);

  const rows = useMemo(() => {
    if (!data) return [];
    const term = q.trim().toLowerCase();
    return data.enq.filter((e) => {
      if (status && e.status !== status) return false;
      if (!status && scope === "active" && !PIPELINE.includes(e.status)) return false;
      if (!status && scope === "closed" && PIPELINE.includes(e.status)) return false;
      if (source && e.source !== source) return false;
      if (term && ![e.id, e.name, e.mobile, e.destination, districtName(e.district)].some((x) => x.toLowerCase().includes(term))) return false;
      return true;
    });
  }, [data, q, status, scope, source]);

  if (loading || !data) return <Loading />;
  const staffName = (id: string) => data.staff.find((s) => s.id === id)?.name.split(" ")[0] ?? "—";

  return (
    <>
      <PageTitle title={title} sub={sub} actions={<Link href="/executive/new/" className="btn btn-primary btn-sm">+ Create Enquiry</Link>} />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input className="input dash w-64" placeholder="Search ID, name, mobile, place…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search enquiries" />
        <select className="input dash w-auto" value={status} onChange={(e) => router.replace(`?status=${e.target.value}`)} aria-label="Status">
          <option value="">All statuses</option>
          {[...PIPELINE, ...OUTCOMES, ...EXCEPTIONS].map((s) => <option key={s} value={s}>{ENQUIRY_STATUS_LABEL[s]}</option>)}
        </select>
        {!status && (
          <div className="flex rounded-lg border border-line bg-white p-0.5 text-sm">
            {(["active", "closed", "all"] as const).map((s) => (
              <button key={s} onClick={() => setScope(s)} className={`rounded-md px-3 py-1.5 capitalize ${scope === s ? "bg-navy text-white" : "text-muted"}`}>{s}</button>
            ))}
          </div>
        )}
        <select className="input dash w-auto" value={source} onChange={(e) => setSource(e.target.value)} aria-label="Source">
          <option value="">All sources</option><option value="web-form">Web form</option><option value="no-results">No-results search</option><option value="phone">Phone</option><option value="manual">Manual</option>
        </select>
        <span className="ml-auto text-sm text-muted">{rows.length} enquiries</span>
      </div>
      {rows.length ? (
        <div className="card overflow-x-auto">
          <table className="tbl min-w-[900px]">
            <thead><tr><th>ID</th><th>Received</th><th>Customer</th><th>Trip</th><th>Vehicle</th><th>Status</th><th>Owner</th><th>Follow-up</th></tr></thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id} className="cursor-pointer" onClick={() => router.push(`${detailBase}?id=${e.id}`)}>
                  <td><Link href={`${detailBase}?id=${e.id}`} className="font-semibold text-blue hover:underline" onClick={(ev) => ev.stopPropagation()}>{e.id}</Link>{e.source === "no-results" && <div><Pill tone="orange">No results</Pill></div>}</td>
                  <td className="whitespace-nowrap text-muted">{fmtDateTime(e.createdAt)}</td>
                  <td><div className="font-medium">{e.name}</div><div className="text-xs text-muted">{e.mobile}</div></td>
                  <td><div>{districtName(e.district)} → {e.destination}</div><div className="text-xs text-muted">{fmtDate(e.travelDate)} · {e.passengers} pax</div></td>
                  <td className="text-muted">{e.vehicleType === "any" ? "Any" : categoryById(e.vehicleType)?.name}</td>
                  <td><Pill tone={toneFor(e.status)}>{ENQUIRY_STATUS_LABEL[e.status]}</Pill></td>
                  <td>{staffName(e.assignedTo)}</td>
                  <td className={e.followUpDate && e.followUpDate < today && PIPELINE.includes(e.status) ? "font-semibold text-red-700" : "text-muted"}>{fmtDate(e.followUpDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>No enquiries match these filters.</Empty>
      )}
    </>
  );
}
