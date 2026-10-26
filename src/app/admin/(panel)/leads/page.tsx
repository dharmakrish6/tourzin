"use client";
import Link from "next/link";
import { categoryById, districtName } from "@/lib/constants";
import { db } from "@/lib/data";
import { useAsync } from "@/lib/hooks";
import { Empty, fmtDateTime, Loading, Pill } from "@/components/staff/kit";
import { PageTitle } from "@/components/staff/StaffShell";

export default function LeadsPage() {
  const { data, loading, reload } = useAsync(() => db.listLeads());
  if (loading || !data) return <Loading />;
  return (
    <>
      <PageTitle title="Operator Leads" sub="Submissions from the Join Tourzin form" />
      {data.length ? (
        <div className="card overflow-x-auto">
          <table className="tbl min-w-[900px]">
            <thead><tr><th>Received</th><th>Company</th><th>Contact</th><th>District</th><th>Vehicle types</th><th>Fleet</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {data.map((l) => (
                <tr key={l.id}>
                  <td className="whitespace-nowrap text-muted">{fmtDateTime(l.createdAt)}</td>
                  <td className="font-medium">{l.companyName}</td>
                  <td>{l.contactPerson}<div className="text-xs text-muted">{l.mobile}{l.whatsapp !== l.mobile && ` · WA ${l.whatsapp}`}</div></td>
                  <td>{districtName(l.district)}</td>
                  <td className="text-xs">{l.vehicleTypes.map((t) => categoryById(t)?.name).join(", ")}</td>
                  <td>{l.fleetSize}</td>
                  <td>{l.handled ? <Pill tone="green">Handled</Pill> : <Pill tone="blue">New</Pill>}</td>
                  <td className="whitespace-nowrap">
                    {!l.handled && <Link href={`/admin/operators/edit/?id=new&lead=${l.id}`} className="btn btn-blue btn-sm">Create operator</Link>}{" "}
                    <button className="btn btn-ghost btn-sm" onClick={async () => { await db.saveLead({ ...l, handled: !l.handled }); reload(); }}>{l.handled ? "Reopen" : "Mark handled"}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <Empty>No operator leads yet.</Empty>}
    </>
  );
}
