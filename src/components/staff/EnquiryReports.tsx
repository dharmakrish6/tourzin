"use client";
import { useMemo, useState } from "react";
import { districtName, ENQUIRY_STATUS_LABEL, EXCEPTIONS, OUTCOMES, PIPELINE } from "@/lib/constants";
import { db } from "@/lib/data";
import { useAsync } from "@/lib/hooks";
import { Loading, Stat } from "./kit";
import { PageTitle } from "./StaffShell";

export function Bars({ title, rows }: { title: string; rows: [string, number][] }) {
  const max = Math.max(1, ...rows.map((r) => r[1]));
  return (
    <section className="card p-5">
      <h2 className="mb-4 font-semibold text-navy">{title}</h2>
      {rows.length ? (
        <ul className="space-y-2.5">
          {rows.map(([k, v]) => (
            <li key={k} className="grid grid-cols-[150px_1fr_40px] items-center gap-3 text-sm">
              <span className="truncate text-muted" title={k}>{k}</span>
              <span className="h-2.5 overflow-hidden rounded-full bg-soft"><span className="block h-full rounded-full bg-blue" style={{ width: `${(v / max) * 100}%` }} /></span>
              <span className="text-right font-semibold tabular-nums text-navy">{v}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">No data yet.</p>
      )}
    </section>
  );
}

const count = <T,>(list: T[], key: (x: T) => string) => {
  const m = new Map<string, number>();
  list.forEach((x) => m.set(key(x), (m.get(key(x)) ?? 0) + 1));
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
};

export function EnquiryReports() {
  const { data, loading } = useAsync(() => db.listEnquiries());
  const [days, setDays] = useState(30);
  const list = useMemo(() => {
    const since = Date.now() - days * 86400000;
    return (data ?? []).filter((e) => new Date(e.createdAt).getTime() >= since);
  }, [data, days]);
  if (loading) return <Loading />;

  const booked = list.filter((e) => e.status === "booked").length;
  const notBooked = list.filter((e) => e.status === "not-booked").length;
  const decided = booked + notBooked;

  return (
    <>
      <PageTitle
        title="Enquiry Reports"
        sub="Basic enquiry, status and outcome reporting"
        actions={
          <select className="input dash w-auto" value={days} onChange={(e) => setDays(+e.target.value)} aria-label="Period">
            <option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option><option value={3650}>All time</option>
          </select>
        }
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="Enquiries" value={list.length} />
        <Stat label="In pipeline" value={list.filter((e) => PIPELINE.includes(e.status)).length} />
        <Stat label="Booked" value={booked} tone="good" />
        <Stat label="Not booked" value={notBooked} tone="bad" />
        <Stat label="Booking rate" value={decided ? `${Math.round((booked / decided) * 100)}%` : "—"} hint="Booked ÷ (booked + not booked)" />
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Bars title="By status" rows={[...PIPELINE, ...OUTCOMES, ...EXCEPTIONS].map((s) => [ENQUIRY_STATUS_LABEL[s], list.filter((e) => e.status === s).length] as [string, number]).filter((r) => r[1])} />
        <Bars title="By source" rows={count(list, (e) => ({ "web-form": "Web form", "no-results": "No-results search", phone: "Phone", manual: "Manual" })[e.source])} />
        <Bars title="By pickup district" rows={count(list, (e) => districtName(e.district)).slice(0, 10)} />
        <Bars title="Supply gaps (No Supply)" rows={count(list.filter((e) => e.status === "no-supply" || e.source === "no-results"), (e) => districtName(e.district))} />
      </div>
    </>
  );
}
