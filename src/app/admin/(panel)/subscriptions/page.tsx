"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Empty, fmtDate, Loading, Pill, toneFor, useToast } from "@/components/staff/kit";
import { PaymentForm } from "@/components/staff/PaymentForm";
import { PageTitle } from "@/components/staff/StaffShell";
import { SUBSCRIPTION_STATUS_LABEL } from "@/lib/constants";
import { db } from "@/lib/data";
import { useAsync } from "@/lib/hooks";
import { daysToExpiry, effectiveSubscription, isSubscriptionVisible } from "@/lib/search";
import type { Operator } from "@/lib/types";

export default function SubscriptionsPage() {
  const { data, loading, reload } = useAsync(async () => {
    const [ops, cfg] = await Promise.all([db.listOperators(), db.getSiteConfig()]);
    return { ops, cfg };
  });
  const [filter, setFilter] = useState("");
  const [pay, setPay] = useState<Operator | null>(null);
  const { toast, toastNode } = useToast();
  const rows = useMemo(() => (data?.ops ?? []).map((o) => ({ o, s: effectiveSubscription(o), d: daysToExpiry(o) })).filter((r) => !filter || r.s === filter).sort((a, b) => a.d - b.d), [data, filter]);
  if (loading || !data) return <Loading />;

  const setOverride = async (o: Operator, v: Operator["visibilityOverride"]) => { await db.saveOperator({ ...o, visibilityOverride: v }); toast("Visibility updated"); reload(); };

  return (
    <>
      {toastNode}
      <PageTitle title="Subscriptions" sub="Base / Premium plans, expiry and public visibility (automatic rules + admin override)" />
      <div className="mb-4 flex flex-wrap gap-2">
        {["", "active", "expiring-soon", "trial", "pending-payment", "expired", "paused", "cancelled"].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`rounded-full border px-3 py-1 text-sm ${filter === s ? "border-navy bg-navy text-white" : "border-line bg-white text-muted"}`}>
            {s ? SUBSCRIPTION_STATUS_LABEL[s as keyof typeof SUBSCRIPTION_STATUS_LABEL] : "All"}
          </button>
        ))}
      </div>
      {rows.length ? (
        <div className="card overflow-x-auto">
          <table className="tbl min-w-[1000px]">
            <thead><tr><th>Operator</th><th>Plan</th><th>Status</th><th>Start</th><th>Expiry</th><th>Days left</th><th>Public visibility</th><th></th></tr></thead>
            <tbody>
              {rows.map(({ o, s, d }) => (
                <tr key={o.id}>
                  <td><Link href={`/admin/operators/edit/?id=${o.id}`} className="font-medium text-blue hover:underline">{o.name}</Link></td>
                  <td><Pill tone={o.plan === "premium" ? "navy" : "gray"}>{o.plan}</Pill></td>
                  <td><Pill tone={toneFor(s)}>{SUBSCRIPTION_STATUS_LABEL[s]}</Pill>{d >= 0 && d <= 7 && <div className="mt-1 text-xs font-semibold text-orange-600">⏰ 7-day reminder</div>}</td>
                  <td className="text-muted">{fmtDate(o.subscriptionStart)}</td>
                  <td>{fmtDate(o.subscriptionExpiry)}</td>
                  <td className={d < 0 ? "text-red-700" : d <= 7 ? "font-semibold text-orange-600" : ""}>{d}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      {isSubscriptionVisible(o, data.cfg) ? <Pill tone="green">Visible</Pill> : <Pill tone="gray">Hidden</Pill>}
                      <select aria-label="Visibility override" className="input dash w-auto" value={o.visibilityOverride} onChange={(e) => setOverride(o, e.target.value as Operator["visibilityOverride"])}>
                        <option value="auto">Auto</option><option value="force-show">Force show</option><option value="force-hide">Force hide</option>
                      </select>
                    </div>
                  </td>
                  <td><button className="btn btn-secondary btn-sm" onClick={() => setPay(o)}>Record payment</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <Empty>No subscriptions in this state.</Empty>}
      <p className="mt-3 text-xs text-muted">Default rules: Active &amp; Expiring Soon → visible; Expired, Paused/Suspended, Cancelled → hidden; Trial / Pending Payment → {data.cfg.trialVisible ? "visible" : "hidden"} (configurable in Homepage &amp; Settings).</p>
      {pay && <PaymentForm operator={pay} onClose={() => setPay(null)} onSaved={() => { setPay(null); toast("Payment recorded"); reload(); }} />}
    </>
  );
}
