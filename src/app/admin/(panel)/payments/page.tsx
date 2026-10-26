"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Empty, fmtDate, Loading, Pill, Stat } from "@/components/staff/kit";
import { PageTitle } from "@/components/staff/StaffShell";
import { db } from "@/lib/data";
import { useAsync } from "@/lib/hooks";
import { formatINR } from "@/lib/search";

export default function PaymentsPage() {
  const { data, loading } = useAsync(async () => {
    const [p, ops] = await Promise.all([db.listPayments(), db.listOperators()]);
    return { p: p.sort((a, b) => b.date.localeCompare(a.date)), ops };
  });
  const [month, setMonth] = useState("");
  const rows = useMemo(() => (data?.p ?? []).filter((p) => !month || p.date.startsWith(month)), [data, month]);
  if (loading || !data) return <Loading />;
  const months = [...new Set(data.p.map((p) => p.date.slice(0, 7)))].sort().reverse();
  const total = rows.reduce((a, p) => a + p.amount, 0);

  const exportCsv = () => {
    const head = "date,operator,amount,mode,reference,plan,period_start,period_end,renewal";
    const body = rows.map((p) => [p.date, `"${data.ops.find((o) => o.id === p.operatorId)?.name ?? p.operatorId}"`, p.amount, p.mode, `"${p.reference}"`, p.plan, p.periodStart, p.periodEnd, p.renewal].join(","));
    const url = URL.createObjectURL(new Blob([[head, ...body].join("\n")], { type: "text/csv" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `tourzin-payments${month ? "-" + month : ""}.csv` });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageTitle title="Payments" sub="Manual payment records (no payment gateway in MVP)" actions={<button className="btn btn-secondary btn-sm" onClick={exportCsv}>Export CSV</button>} />
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Payments" value={rows.length} />
        <Stat label="Collected" value={formatINR(total)} tone="good" />
        <Stat label="Renewals" value={rows.filter((p) => p.renewal).length} />
        <div className="card p-4"><label className="text-xs font-medium uppercase tracking-wide text-muted" htmlFor="m">Month</label><select id="m" className="input dash mt-1" value={month} onChange={(e) => setMonth(e.target.value)}><option value="">All time</option>{months.map((m) => <option key={m}>{m}</option>)}</select></div>
      </div>
      {rows.length ? (
        <div className="card overflow-x-auto">
          <table className="tbl min-w-[860px]">
            <thead><tr><th>Date</th><th>Operator</th><th>Amount</th><th>Mode</th><th>Reference</th><th>Period</th><th>Plan</th></tr></thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td>{fmtDate(p.date)}</td>
                  <td><Link href={`/admin/operators/edit/?id=${p.operatorId}`} className="text-blue hover:underline">{data.ops.find((o) => o.id === p.operatorId)?.name ?? p.operatorId}</Link></td>
                  <td className="font-semibold">{formatINR(p.amount)}</td>
                  <td className="capitalize">{p.mode.replace("-", " ")}</td>
                  <td className="text-muted">{p.reference}</td>
                  <td className="text-xs">{fmtDate(p.periodStart)} – {fmtDate(p.periodEnd)}</td>
                  <td><Pill tone={p.plan === "premium" ? "navy" : "gray"}>{p.plan}</Pill> {p.renewal && <Pill tone="green">renewal</Pill>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <Empty>No payments for this period.</Empty>}
      <p className="mt-3 text-xs text-muted">Record new payments from an operator&apos;s page or from Subscriptions. Payment history is kept across renewals.</p>
    </>
  );
}
