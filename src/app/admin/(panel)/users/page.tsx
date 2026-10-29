"use client";
import { useState, type FormEvent } from "react";
import { DField, Loading, Pill, useToast } from "@/components/staff/kit";
import { PageTitle, useStaff } from "@/components/staff/StaffShell";
import { db } from "@/lib/data";
import { useAsync } from "@/lib/hooks";
import type { Role } from "@/lib/types";

export default function UsersPage() {
  const me = useStaff();
  const { data, loading, reload } = useAsync(() => db.listStaff());
  const [f, setF] = useState({ name: "", email: "", role: "executive" as Role });
  const { toast, toastNode } = useToast();
  if (loading || !data) return <Loading />;

  const add = async (e: FormEvent) => {
    e.preventDefault();
    if (!f.name || !/^\S+@\S+\.\S+$/.test(f.email)) return toast("Enter name and a valid email");
    await db.saveStaff({ id: f.email.trim().toLowerCase(), ...f, active: true });
    setF({ name: "", email: "", role: "executive" });
    toast("User added");
    reload();
  };

  return (
    <>
      {toastNode}
      <PageTitle title="Users & Roles" sub="Admin: full access · Executive: enquiries, matching, availability, notes, outcomes" />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="card overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead>
            <tbody>
              {data.map((u) => (
                <tr key={u.id}>
                  <td className="font-medium">{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <select className="input dash w-auto" value={u.role} disabled={u.id === me.id} aria-label="Role" onChange={async (e) => { await db.saveStaff({ ...u, role: e.target.value as Role }); reload(); }}>
                      <option value="admin">Admin</option><option value="executive">Executive</option>
                    </select>
                  </td>
                  <td>
                    <button disabled={u.id === me.id} onClick={async () => { await db.saveStaff({ ...u, active: !u.active }); reload(); }}>
                      {u.active ? <Pill tone="green">Active</Pill> : <Pill tone="gray">Disabled</Pill>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form onSubmit={add} className="card h-fit space-y-3 p-5">
          <h2 className="font-semibold text-navy">Add user</h2>
          <DField label="Name"><input className="input dash" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></DField>
          <DField label="Email"><input className="input dash" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></DField>
          <DField label="Role"><select className="input dash" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value as Role })}><option value="executive">Executive</option><option value="admin">Admin</option></select></DField>
          <button className="btn btn-primary btn-sm">Add user</button>
          <p className="text-xs text-muted">The user signs in with Google using this email address.</p>
        </form>
      </div>
    </>
  );
}
