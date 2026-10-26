"use client";
import { useState, type FormEvent } from "react";
import { track } from "@/lib/analytics";
import { DISTRICTS, VEHICLE_CATEGORIES } from "@/lib/constants";
import { db } from "@/lib/data";
import type { VehicleTypeId } from "@/lib/types";
import { Success } from "../ui";
import { aria, cleanPhone, Field, focusFirstError, isMobile, type Errors } from "./fields";

type Form = {
  companyName: string;
  contactPerson: string;
  mobile: string;
  whatsapp: string;
  district: string;
  vehicleTypes: VehicleTypeId[];
  fleetSize: string;
};

const empty: Form = { companyName: "", contactPerson: "", mobile: "", whatsapp: "", district: "", vehicleTypes: [], fleetSize: "" };

/** Join Tourzin — initial fields only (spec §16.1). Feeds Admin → Operator Leads. */
export function JoinForm() {
  const [f, setF] = useState<Form>(empty);
  const [sameWa, setSameWa] = useState(true);
  const [errors, setErrors] = useState<Errors<Form>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [fail, setFail] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setF((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    const e: Errors<Form> = {};
    if (!f.companyName.trim()) e.companyName = "Please enter your operator / company name";
    if (!f.contactPerson.trim()) e.contactPerson = "Please enter a contact person";
    if (!isMobile(f.mobile)) e.mobile = "Enter a valid 10-digit mobile number";
    if (!sameWa && !isMobile(f.whatsapp)) e.whatsapp = "Enter a valid 10-digit WhatsApp number";
    if (!f.district) e.district = "Please choose your district";
    if (!f.vehicleTypes.length) e.vehicleTypes = "Choose at least one vehicle type";
    if (!f.fleetSize) e.fleetSize = "Please choose your approximate fleet size";
    setErrors(e);
    if (Object.values(e).some(Boolean)) return focusFirstError(e, "j-");
    setBusy(true);
    setFail(null);
    try {
      const mob = f.mobile.replace(/\D/g, "").slice(-10);
      await db.createLead({ ...f, mobile: mob, whatsapp: sameWa ? mob : f.whatsapp.replace(/\D/g, "").slice(-10) });
      track("operator_join_submitted", { district: f.district, fleet: f.fleetSize });
      setDone(true);
    } catch {
      setFail("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (done)
    return (
      <Success title="Thanks for your interest in Tourzin">
        Our team will contact you shortly to collect your vehicle details and photos and explain the plans.
      </Success>
    );

  return (
    <form
      noValidate
      onSubmit={submit}
      onFocus={() => !started && (setStarted(true), track("operator_join_started"))}
      className="card grid gap-4 p-5 sm:grid-cols-2 sm:p-7"
    >
      <h2 className="text-xl font-bold text-navy sm:col-span-2">Join Tourzin</h2>
      <Field id="j-companyName" label="Operator / Company Name" required error={errors.companyName}>
        <input {...aria("j-companyName", errors.companyName)} className="input" value={f.companyName} onChange={(e) => set("companyName", e.target.value)} maxLength={100} />
      </Field>
      <Field id="j-contactPerson" label="Contact Person" required error={errors.contactPerson}>
        <input {...aria("j-contactPerson", errors.contactPerson)} className="input" autoComplete="name" value={f.contactPerson} onChange={(e) => set("contactPerson", e.target.value)} maxLength={80} />
      </Field>
      <Field id="j-mobile" label="Mobile" required error={errors.mobile}>
        <input {...aria("j-mobile", errors.mobile)} type="tel" inputMode="tel" className="input" value={f.mobile} onChange={(e) => set("mobile", cleanPhone(e.target.value))} />
      </Field>
      <Field id="j-whatsapp" label="WhatsApp" required={!sameWa} error={errors.whatsapp}>
        <input {...aria("j-whatsapp", errors.whatsapp)} type="tel" inputMode="tel" className="input" disabled={sameWa} value={sameWa ? f.mobile : f.whatsapp} onChange={(e) => set("whatsapp", cleanPhone(e.target.value))} />
        <label className="mt-2 flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={sameWa} onChange={(e) => setSameWa(e.target.checked)} className="h-4 w-4 accent-[#1769AA]" /> Same as mobile
        </label>
      </Field>
      <Field id="j-district" label="District" required error={errors.district}>
        <select {...aria("j-district", errors.district)} className="input" value={f.district} onChange={(e) => set("district", e.target.value)}>
          <option value="">Select district</option>
          {DISTRICTS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </Field>
      <Field id="j-fleetSize" label="Approximate Fleet Size" required error={errors.fleetSize}>
        <select {...aria("j-fleetSize", errors.fleetSize)} className="input" value={f.fleetSize} onChange={(e) => set("fleetSize", e.target.value)}>
          <option value="">Select</option>
          {["1", "2–5", "6–10", "11–20", "20+"].map((s) => <option key={s} value={s}>{s} {s === "1" ? "vehicle" : "vehicles"}</option>)}
        </select>
      </Field>
      <fieldset className="sm:col-span-2" aria-describedby={errors.vehicleTypes ? "j-vehicleTypes-err" : undefined}>
        <legend className="label req">Vehicle Types</legend>
        <div className="flex flex-wrap gap-2" id="j-vehicleTypes" tabIndex={-1}>
          {VEHICLE_CATEGORIES.map((c) => {
            const on = f.vehicleTypes.includes(c.id);
            return (
              <label key={c.id} className={`flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${on ? "border-blue bg-blue-50 text-blue" : "border-line hover:bg-soft"}`}>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={on}
                  onChange={() => set("vehicleTypes", on ? f.vehicleTypes.filter((x) => x !== c.id) : [...f.vehicleTypes, c.id])}
                />
                {c.name}
              </label>
            );
          })}
        </div>
        {errors.vehicleTypes && <p id="j-vehicleTypes-err" className="field-error" role="alert">{errors.vehicleTypes}</p>}
      </fieldset>
      {fail && <p className="field-error sm:col-span-2" role="alert">{fail}</p>}
      <button disabled={busy} className="btn btn-primary sm:col-span-2">{busy ? "Submitting…" : "Join Tourzin"}</button>
    </form>
  );
}
