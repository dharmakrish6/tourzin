"use client";
import { useMemo, useState } from "react";
import { Bars } from "@/components/staff/EnquiryReports";
import { Loading, Stat } from "@/components/staff/kit";
import { PageTitle } from "@/components/staff/StaffShell";
import { categoryById, districtName } from "@/lib/constants";
import { db } from "@/lib/data";
import { useAsync } from "@/lib/hooks";

const FUNNEL: [string, string][] = [
  ["homepage_search_started", "Search started"],
  ["search_completed", "Search completed"],
  ["search_results_viewed", "Results viewed"],
  ["contact_clicked", "Call / WhatsApp clicked"],
  ["safety_checklist_accepted", "Safety checklist accepted"],
];

export default function ReportsPage() {
  const { data, loading } = useAsync(() => db.listEvents());
  const [days, setDays] = useState(30);
  const ev = useMemo(() => {
    const since = Date.now() - days * 86400000;
    return (data ?? []).filter((e) => new Date(e.at).getTime() >= since);
  }, [data, days]);
  if (loading) return <Loading />;

  const n = (name: string) => ev.filter((e) => e.name === name).length;
  const by = (name: string, key: string, fmt: (v: string) => string = (v) => v) => {
    const m = new Map<string, number>();
    ev.filter((e) => e.name === name && e.props[key]).forEach((e) => { const k = fmt(String(e.props[key])); m.set(k, (m.get(k) ?? 0) + 1); });
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  };
  const funnel = FUNNEL.map(([k, l]) => [l, n(k)] as [string, number]);

  return (
    <>
      <PageTitle
        title="Analytics & Reports"
        sub="Marketplace funnel and demand signals (spec §14 events)"
        actions={<select className="input dash w-auto" value={days} onChange={(e) => setDays(+e.target.value)} aria-label="Period"><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option></select>}
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Stat label="Searches" value={n("search_completed")} />
        <Stat label="No-result searches" value={n("no_results_search")} tone="warn" />
        <Stat label="Contact clicks" value={n("contact_clicked")} />
        <Stat label="Calls (number revealed)" value={n("number_revealed")} />
        <Stat label="WhatsApp opened" value={n("whatsapp_opened")} />
        <Stat label="Help forms submitted" value={n("help_form_submitted")} />
      </div>
      <section className="card mt-6 p-5">
        <h2 className="mb-4 font-semibold text-navy">Customer funnel</h2>
        <ol className="space-y-2">
          {funnel.map(([l, v], i) => {
            const pct = funnel[0][1] ? Math.round((v / funnel[0][1]) * 100) : 0;
            return (
              <li key={l} className="grid grid-cols-[180px_1fr_90px] items-center gap-3 text-sm">
                <span className="text-muted">{i + 1}. {l}</span>
                <span className="h-6 overflow-hidden rounded-md bg-soft"><span className="block h-full rounded-md bg-blue" style={{ width: `${pct}%` }} /></span>
                <span className="text-right font-semibold tabular-nums">{v} <span className="text-xs font-normal text-muted">{pct}%</span></span>
              </li>
            );
          })}
        </ol>
      </section>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Bars title="District demand (searches)" rows={by("search_completed", "district", districtName)} />
        <Bars title="Supply gaps (no-result searches)" rows={by("no_results_search", "district", districtName)} />
        <Bars title="Vehicle type demand" rows={by("vehicle_type_selected", "vehicle_type", (v) => categoryById(v)?.name ?? v)} />
        <Bars title="Supply acquisition" rows={[["Join form started", n("operator_join_started")], ["Join form submitted", n("operator_join_submitted")], ["Featured operator clicks", n("featured_operator_clicked")], ["Category page → search", n("vehicle_category_cta_clicked")], ["District page → search", n("district_cta_clicked")]]} />
      </div>
    </>
  );
}
