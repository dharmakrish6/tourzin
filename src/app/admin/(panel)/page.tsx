"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { fmtDate, Loading, Pill, SortTh, Stat, toneFor } from "@/components/staff/kit";
import { PageTitle } from "@/components/staff/StaffShell";
import { districtName, SUBSCRIPTION_STATUS_LABEL } from "@/lib/constants";
import { db } from "@/lib/data";
import { useAsync } from "@/lib/hooks";
import { daysToExpiry, effectiveSubscription, formatINR, isPubliclyListed } from "@/lib/search";

type K = "name" | "plan" | "calls" | "whatsapp" | "assisted" | "options" | "booked" | "notBooked";

export default function AdminDashboard() {
  const { data, loading } = useAsync(async () => {
    const [ops, vehicles, payments, enquiries, events, cfg, leads] = await Promise.all([
      db.listOperators(), db.listVehicles(), db.listPayments(), db.listEnquiries(), db.listEvents(), db.getSiteConfig(), db.listLeads(),
    ]);
    return { ops, vehicles, payments, enquiries, events, cfg, leads };
  });
  const [sort, setSort] = useState<{ k: K; dir: 1 | -1 }>({ k: "calls", dir: -1 });

  const kpi = useMemo(() => {
    if (!data) return null;
    const now = new Date();
    const ym = now.toISOString().slice(0, 7);
    const subs = data.ops.map((o) => ({ o, s: effectiveSubscription(o) }));
    const live = subs.filter(({ s }) => s === "active" || s === "expiring-soon");
    const revenueMonth = data.payments.filter((p) => p.date.startsWith(ym)).reduce((a, p) => a + p.amount, 0);
    const revenueTotal = data.payments.reduce((a, p) => a + p.amount, 0);
    const expiring = subs.filter(({ o, s }) => s === "expiring-soon" || (s === "active" && daysToExpiry(o) <= 7)).map(({ o }) => o).sort((a, b) => a.subscriptionExpiry.localeCompare(b.subscriptionExpiry));
    const expiredPaused = subs.filter(({ s }) => ["expired", "paused", "cancelled"].includes(s)).length;
    const renewedMonth = data.payments.filter((p) => p.renewal && p.date.startsWith(ym)).length;
    const lapsedMonth = data.ops.filter((o) => o.subscriptionExpiry.startsWith(ym) && effectiveSubscription(o) === "expired").length;
    return {
      base: live.filter(({ o }) => o.plan === "base").length,
      premium: live.filter(({ o }) => o.plan === "premium").length,
      revenueMonth, revenueTotal, expiring, expiredPaused, renewedMonth, lapsedMonth,
      renewalRate: renewedMonth + lapsedMonth ? Math.round((renewedMonth / (renewedMonth + lapsedMonth)) * 100) : null,
      listed: data.ops.filter((o) => isPubliclyListed(o, data.vehicles, data.cfg)).length,
      newLeads: data.leads.filter((l) => !l.handled).length,
      pendingVehicles: data.vehicles.filter((v) => v.status === "pending-review").length,
    };
  }, [data]);

  const perf = useMemo(() => {
    if (!data) return [];
    const ev = (name: string, id: string) => data.events.filter((e) => e.name === name && e.props.operator_id === id).length;
    const rows = data.ops
      .filter((o) => o.status === "active")
      .map((o) => {
        const matched = data.enquiries.filter((e) => e.matches.some((m) => m.operatorId === o.id));
        return {
          o,
          name: o.name,
          plan: o.plan,
          calls: ev("number_revealed", o.id),
          whatsapp: ev("whatsapp_opened", o.id),
          assisted: matched.length,
          options: matched.filter((e) => e.matches.some((m) => m.operatorId === o.id && m.inOptions)).length,
          booked: data.enquiries.filter((e) => e.selectedOperatorId === o.id && e.status === "booked").length,
          notBooked: data.enquiries.filter((e) => e.selectedOperatorId === o.id && e.status === "not-booked").length,
        };
      });
    return rows.sort((a, b) => {
      const x = a[sort.k], y = b[sort.k];
      return (typeof x === "number" ? x - (y as number) : String(x).localeCompare(String(y))) * sort.dir;
    });
  }, [data, sort]);

  if (loading || !data || !kpi) return <Loading />;

  return (
    <>
      <PageTitle title="Admin Dashboard" sub="Subscriptions, revenue and operator activity" />
      {(kpi.newLeads > 0 || kpi.pendingVehicles > 0) && (
        <div className="mb-4 flex flex-wrap gap-2 text-sm">
          {kpi.newLeads > 0 && <Link href="/admin/leads/" className="rounded-lg bg-blue-50 px-3 py-1.5 font-medium text-blue">{kpi.newLeads} new operator lead(s) →</Link>}
          {kpi.pendingVehicles > 0 && <Link href="/admin/vehicles/?status=pending-review" className="rounded-lg bg-orange-50 px-3 py-1.5 font-medium text-orange-600">{kpi.pendingVehicles} vehicle(s) pending review →</Link>}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <Stat label="Active Base operators" value={kpi.base} />
        <Stat label="Active Premium operators" value={kpi.premium} />
        <Stat label="Revenue this month" value={formatINR(kpi.revenueMonth)} tone="good" />
        <Stat label="Total revenue collected" value={formatINR(kpi.revenueTotal)} />
        <Stat label="Publicly listed" value={kpi.listed} hint="Pass status, subscription & vehicle rules" />
        <Stat label="Expiring within 7 days" value={kpi.expiring.length} tone={kpi.expiring.length ? "warn" : "default"} />
        <Stat label="Expired / paused" value={kpi.expiredPaused} tone={kpi.expiredPaused ? "bad" : "default"} />
        <Stat label="Renewed this month" value={kpi.renewedMonth} />
        <Stat label="Not renewed this month" value={kpi.lapsedMonth} />
        <Stat label="Renewal rate" value={kpi.renewalRate === null ? "—" : `${kpi.renewalRate}%`} hint="Renewed ÷ eligible renewals" />
      </div>

      <section className="card mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 className="font-semibold text-navy">⏰ Subscriptions expiring within 7 days</h2>
          <Link href="/admin/subscriptions/" className="text-sm text-blue hover:underline">Manage</Link>
        </div>
        {kpi.expiring.length ? (
          <table className="tbl">
            <thead><tr><th>Operator</th><th>Plan</th><th>Status</th><th>Expires</th><th>Days left</th></tr></thead>
            <tbody>
              {kpi.expiring.map((o) => (
                <tr key={o.id}>
                  <td><Link href={`/admin/operators/edit/?id=${o.id}`} className="font-medium text-blue hover:underline">{o.name}</Link><div className="text-xs text-muted">{o.mobile}</div></td>
                  <td className="capitalize">{o.plan}</td>
                  <td><Pill tone={toneFor(effectiveSubscription(o))}>{SUBSCRIPTION_STATUS_LABEL[effectiveSubscription(o)]}</Pill></td>
                  <td>{fmtDate(o.subscriptionExpiry)}</td>
                  <td className="font-semibold text-orange-600">{daysToExpiry(o)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="p-4 text-sm text-muted">No subscriptions expiring this week.</p>
        )}
      </section>

      <section className="card mt-6 overflow-hidden">
        <h2 className="border-b border-line px-4 py-3 font-semibold text-navy">Operator performance <span className="text-xs font-normal text-muted">(all time)</span></h2>
        <div className="overflow-x-auto">
          <table className="tbl min-w-[860px]">
            <thead>
              <tr>
                <SortTh k="name" label="Operator" sort={sort} setSort={setSort} />
                <SortTh k="plan" label="Plan" sort={sort} setSort={setSort} />
                <SortTh k="calls" label="Calls" sort={sort} setSort={setSort} />
                <SortTh k="whatsapp" label="WhatsApp" sort={sort} setSort={setSort} />
                <SortTh k="assisted" label="Assisted matches" sort={sort} setSort={setSort} />
                <SortTh k="options" label="Options sent" sort={sort} setSort={setSort} />
                <SortTh k="booked" label="Booked" sort={sort} setSort={setSort} />
                <SortTh k="notBooked" label="Not booked" sort={sort} setSort={setSort} />
              </tr>
            </thead>
            <tbody>
              {perf.map((r) => (
                <tr key={r.o.id}>
                  <td><Link href={`/admin/operators/edit/?id=${r.o.id}`} className="font-medium text-blue hover:underline">{r.name}</Link><div className="text-xs text-muted">{districtName(r.o.primaryDistrict)}</div></td>
                  <td><Pill tone={r.plan === "premium" ? "navy" : "gray"}>{r.plan}</Pill></td>
                  <td className="tabular-nums">{r.calls}</td>
                  <td className="tabular-nums">{r.whatsapp}</td>
                  <td className="tabular-nums">{r.assisted}</td>
                  <td className="tabular-nums">{r.options}</td>
                  <td className="tabular-nums text-success">{r.booked}</td>
                  <td className="tabular-nums text-red-700">{r.notBooked}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
