"use client";
import Link from "next/link";
import { useMemo } from "react";
import { Empty, fmtDate, Loading, Pill, Stat, toneFor } from "@/components/staff/kit";
import { PageTitle, useStaff } from "@/components/staff/StaffShell";
import { districtName, ENQUIRY_STATUS_LABEL, EXCEPTIONS, OUTCOMES, PIPELINE } from "@/lib/constants";
import { db } from "@/lib/data";
import { useAsync } from "@/lib/hooks";

export default function ExecutiveHome() {
  const me = useStaff();
  const { data, loading } = useAsync(() => db.listEnquiries());
  const today = new Date().toISOString().slice(0, 10);

  const s = useMemo(() => {
    const list = data ?? [];
    const open = list.filter((e) => PIPELINE.includes(e.status));
    return {
      list,
      open,
      fresh: list.filter((e) => e.status === "new"),
      mine: open.filter((e) => e.assignedTo === me.id),
      due: open.filter((e) => e.followUpDate && e.followUpDate <= today).sort((a, b) => a.followUpDate.localeCompare(b.followUpDate)),
      booked: list.filter((e) => e.status === "booked").length,
      closed: list.filter((e) => OUTCOMES.includes(e.status) || EXCEPTIONS.includes(e.status)).length,
    };
  }, [data, me.id, today]);

  if (loading) return <Loading />;

  return (
    <>
      <PageTitle title={`Hello, ${me.name.split(" ")[0]}`} sub="Enquiry operations overview" actions={<Link href="/executive/new/" className="btn btn-primary btn-sm">+ Create Enquiry</Link>} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="New" value={s.fresh.length} tone={s.fresh.length ? "warn" : "default"} />
        <Stat label="Active pipeline" value={s.open.length} />
        <Stat label="Assigned to me" value={s.mine.length} />
        <Stat label="Follow-ups due" value={s.due.length} tone={s.due.length ? "bad" : "good"} />
        <Stat label="Booked (all time)" value={s.booked} tone="good" hint={`${s.closed} closed total`} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="card overflow-hidden">
          <h2 className="border-b border-line px-4 py-3 font-semibold text-navy">Pipeline</h2>
          <ul className="divide-y divide-line">
            {[...PIPELINE, ...OUTCOMES, ...EXCEPTIONS].map((st) => {
              const n = s.list.filter((e) => e.status === st).length;
              if (!n && EXCEPTIONS.includes(st)) return null;
              return (
                <li key={st}>
                  <Link href={`/executive/inbox/?status=${st}`} className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-soft">
                    <Pill tone={toneFor(st)}>{ENQUIRY_STATUS_LABEL[st]}</Pill>
                    <span className="font-semibold text-navy">{n}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="card overflow-hidden">
          <h2 className="border-b border-line px-4 py-3 font-semibold text-navy">Follow-ups due</h2>
          {s.due.length ? (
            <ul className="divide-y divide-line">
              {s.due.map((e) => (
                <li key={e.id}>
                  <Link href={`/executive/enquiry/?id=${e.id}`} className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-soft">
                    <span>
                      <span className="font-semibold text-navy">{e.id}</span> · {e.name}
                      <span className="block text-xs text-muted">{districtName(e.district)} → {e.destination} · {e.passengers} pax</span>
                    </span>
                    <span className={`text-xs font-semibold ${e.followUpDate < today ? "text-red-700" : "text-orange-600"}`}>{e.followUpDate < today ? "Overdue " : "Today "}{fmtDate(e.followUpDate)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4"><Empty>No follow-ups due. 🎉</Empty></div>
          )}
        </section>
      </div>
    </>
  );
}
