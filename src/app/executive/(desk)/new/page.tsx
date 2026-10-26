"use client";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { DField } from "@/components/staff/kit";
import { PageTitle, useStaff } from "@/components/staff/StaffShell";
import { DISTRICTS, VEHICLE_CATEGORIES } from "@/lib/constants";
import { db } from "@/lib/data";
import type { Enquiry, VehicleTypeId } from "@/lib/types";

/** Manual phone-call enquiry creation (spec §9). */
export default function NewEnquiry() {
  const me = useStaff();
  const router = useRouter();
  const [f, setF] = useState({
    source: "phone" as Enquiry["source"], district: "", destination: "", travelDate: "", returnDate: "", passengers: "",
    vehicleType: "any" as VehicleTypeId | "any", acPreference: "no-preference" as Enquiry["acPreference"], name: "", mobile: "", additional: "",
  });
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const mob = f.mobile.replace(/\D/g, "").slice(-10);
    if (!f.district || !f.destination || !f.travelDate || !f.passengers || !f.name || mob.length !== 10) {
      setErr("Please fill District, Destination, Travel Date, Passengers, Name and a valid 10-digit Mobile.");
      return;
    }
    setBusy(true);
    const enq = await db.createEnquiry({ ...f, passengers: +f.passengers, mobile: mob, sourceNote: f.source === "phone" ? "Phone call" : "Manual entry" });
    await db.saveEnquiry({ ...enq, assignedTo: me.id, activity: [...enq.activity, { at: new Date().toISOString(), by: me.name, text: "Created and self-assigned" }] });
    router.push(`/executive/enquiry/?id=${enq.id}`);
  };

  return (
    <>
      <PageTitle title="Create Enquiry" sub="Log an enquiry received by phone or another channel" />
      <form onSubmit={submit} className="card grid max-w-4xl gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
        <DField label="Source">
          <select className="input dash" value={f.source} onChange={(e) => set("source", e.target.value)}>
            <option value="phone">Phone call</option><option value="manual">Other / manual</option>
          </select>
        </DField>
        <DField label="District *">
          <select className="input dash" value={f.district} onChange={(e) => set("district", e.target.value)}>
            <option value="">Select</option>{DISTRICTS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </DField>
        <DField label="Destination *"><input className="input dash" value={f.destination} onChange={(e) => set("destination", e.target.value)} /></DField>
        <DField label="Travel date *"><input type="date" className="input dash" value={f.travelDate} onChange={(e) => set("travelDate", e.target.value)} /></DField>
        <DField label="Return date"><input type="date" className="input dash" value={f.returnDate} onChange={(e) => set("returnDate", e.target.value)} /></DField>
        <DField label="Passengers *"><input inputMode="numeric" className="input dash" value={f.passengers} onChange={(e) => set("passengers", e.target.value.replace(/\D/g, ""))} /></DField>
        <DField label="Vehicle type">
          <select className="input dash" value={f.vehicleType} onChange={(e) => set("vehicleType", e.target.value)}>
            <option value="any">Any / Not sure</option>{VEHICLE_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </DField>
        <DField label="AC preference">
          <select className="input dash" value={f.acPreference} onChange={(e) => set("acPreference", e.target.value)}>
            <option value="no-preference">No preference</option><option value="ac">AC</option><option value="non-ac">Non-AC</option>
          </select>
        </DField>
        <DField label="Customer name *"><input className="input dash" value={f.name} onChange={(e) => set("name", e.target.value)} /></DField>
        <DField label="Mobile *"><input className="input dash" inputMode="tel" value={f.mobile} onChange={(e) => set("mobile", e.target.value)} /></DField>
        <DField label="Additional requirement" className="sm:col-span-2"><input className="input dash" value={f.additional} onChange={(e) => set("additional", e.target.value)} /></DField>
        {err && <p className="field-error sm:col-span-2 lg:col-span-3">{err}</p>}
        <div className="sm:col-span-2 lg:col-span-3"><button disabled={busy} className="btn btn-primary btn-sm">{busy ? "Creating…" : "Create enquiry"}</button></div>
      </form>
    </>
  );
}
