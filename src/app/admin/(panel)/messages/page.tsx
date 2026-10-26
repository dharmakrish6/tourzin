"use client";
import { Empty, fmtDateTime, Loading } from "@/components/staff/kit";
import { PageTitle } from "@/components/staff/StaffShell";
import { db } from "@/lib/data";
import { useAsync } from "@/lib/hooks";

export default function MessagesPage() {
  const { data, loading } = useAsync(() => db.listContactMessages());
  if (loading || !data) return <Loading />;
  return (
    <>
      <PageTitle title="Contact Messages" sub="From the public Contact page" />
      {data.length ? (
        <ul className="space-y-3">
          {data.map((m) => (
            <li key={m.id} className="card p-4">
              <div className="flex flex-wrap justify-between gap-2"><p className="font-semibold text-navy">{m.subject}</p><p className="text-xs text-muted">{fmtDateTime(m.createdAt)}</p></div>
              <p className="mt-1 text-sm">{m.message}</p>
              <p className="mt-2 text-xs text-muted">{m.name} · <a className="text-blue" href={`tel:+91${m.mobile}`}>{m.mobile}</a>{m.email && <> · <a className="text-blue" href={`mailto:${m.email}`}>{m.email}</a></>}</p>
            </li>
          ))}
        </ul>
      ) : <Empty>No messages yet. Submit one from the public Contact page to see it here.</Empty>}
    </>
  );
}
