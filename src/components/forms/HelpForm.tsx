"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { track } from "@/lib/analytics";
import { categoryById, DISTRICTS, districtById, VEHICLE_CATEGORIES } from "@/lib/constants";
import { db } from "@/lib/data";
import type { Enquiry, VehicleTypeId } from "@/lib/types";
import { Success } from "../ui";
import { aria, cleanPhone, Field, focusFirstError, isMobile, type Errors } from "./fields";

type Form = {
  district: string;
  destination: string;
  travelDate: string;
  returnDate: string;
  passengers: string;
  vehicleType: VehicleTypeId | "any";
  acPreference: Enquiry["acPreference"];
  name: string;
  mobile: string;
  additional: string;
};

const todayStr = () => new Date().toISOString().slice(0, 10);

export function HelpForm() {
  const sp = useSearchParams();
  const src = sp.get("src");
  const preType = sp.get("type") as VehicleTypeId | null;
  const [f, setF] = useState<Form>({
    district: districtById(sp.get("district") ?? "") ? sp.get("district")! : "",
    destination: "",
    travelDate: "",
    returnDate: "",
    passengers: (sp.get("passengers") ?? "").replace(/\D/g, ""),
    vehicleType: preType && categoryById(preType) ? preType : "any",
    acPreference: "no-preference",
    name: "",
    mobile: "",
    additional: "",
  });
  const [errors, setErrors] = useState<Errors<Form>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setF((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = (): Errors<Form> => {
    const e: Errors<Form> = {};
    if (!f.district) e.district = "Please choose your pickup district";
    if (!f.destination.trim()) e.destination = "Please enter your destination";
    if (!f.travelDate) e.travelDate = "Please choose your travel date";
    else if (f.travelDate < todayStr()) e.travelDate = "Travel date can't be in the past";
    if (f.returnDate && f.travelDate && f.returnDate < f.travelDate) e.returnDate = "Return date must be on or after the travel date";
    const pax = parseInt(f.passengers, 10);
    if (!f.passengers) e.passengers = "Please enter the number of passengers";
    else if (!pax || pax < 1 || pax > 300) e.passengers = "Enter a number between 1 and 300";
    if (!f.name.trim()) e.name = "Please enter your name";
    if (!f.mobile.trim()) e.mobile = "Please enter your mobile number";
    else if (!isMobile(f.mobile)) e.mobile = "Enter a valid 10-digit Indian mobile number";
    return e;
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.values(e).some(Boolean)) {
      focusFirstError(e, "h-");
      return;
    }
    setBusy(true);
    setSubmitError(null);
    try {
      const noResults = src === "no-results";
      const enq = await db.createEnquiry({
        source: noResults ? "no-results" : "web-form",
        sourceNote: noResults ? "No search results found" : src === "results" ? "From search results page" : "",
        district: f.district,
        destination: f.destination.trim(),
        travelDate: f.travelDate,
        returnDate: f.returnDate,
        passengers: parseInt(f.passengers, 10),
        vehicleType: f.vehicleType,
        acPreference: f.acPreference,
        name: f.name.trim(),
        mobile: f.mobile.replace(/\D/g, "").slice(-10),
        additional: f.additional.trim(),
      });
      track("help_form_submitted", { district: f.district, vehicle_type: f.vehicleType, source: noResults ? "no_results" : "direct" });
      setDone(enq.id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setSubmitError("We couldn't submit your request. Please try again."); // keeps all entered data
    } finally {
      setBusy(false);
    }
  };

  if (done)
    return (
      <Success title="Thanks — we've received your trip details">
        <p>
          Your reference is <strong className="text-navy">{done}</strong>. A Tourzin executive will review your requirement and get
          in touch on your mobile number.
        </p>
        <Link href="/" className="btn btn-secondary mt-6">Back to Home</Link>
      </Success>
    );

  return (
    <form
      noValidate
      onSubmit={submit}
      onFocus={() => {
        if (!started) {
          setStarted(true);
          track("help_form_started", { source: src ?? "direct" });
        }
      }}
      className="card p-5 sm:p-8"
    >
      {src === "no-results" && (
        <p className="mb-6 rounded-xl bg-blue-50 px-4 py-3 text-sm text-ink">
          We&apos;ve filled in your search details — you can change anything below.
        </p>
      )}
      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-4 text-lg font-bold text-navy">Trip details</legend>
        <Field id="h-district" label="Pickup District" required error={errors.district}>
          <select {...aria("h-district", errors.district)} className="input" value={f.district} onChange={(e) => set("district", e.target.value)}>
            <option value="">Select district</option>
            {DISTRICTS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </Field>
        <Field id="h-destination" label="Destination" required error={errors.destination}>
          <input {...aria("h-destination", errors.destination)} className="input" placeholder="e.g. Ooty, Rameswaram" value={f.destination} onChange={(e) => set("destination", e.target.value)} maxLength={120} />
        </Field>
        <Field id="h-travelDate" label="Travel Date" required error={errors.travelDate}>
          <input {...aria("h-travelDate", errors.travelDate)} type="date" min={todayStr()} className="input" value={f.travelDate} onChange={(e) => set("travelDate", e.target.value)} />
        </Field>
        <Field id="h-returnDate" label="Return Date" optional error={errors.returnDate}>
          <input {...aria("h-returnDate", errors.returnDate)} type="date" min={f.travelDate || todayStr()} className="input" value={f.returnDate} onChange={(e) => set("returnDate", e.target.value)} />
        </Field>
        <Field id="h-passengers" label="Passenger Count" required error={errors.passengers}>
          <input {...aria("h-passengers", errors.passengers)} inputMode="numeric" className="input" placeholder="e.g. 14" value={f.passengers} onChange={(e) => set("passengers", e.target.value.replace(/\D/g, "").slice(0, 3))} />
        </Field>
        <Field id="h-vehicleType" label="Vehicle Type" optional>
          <select id="h-vehicleType" className="input" value={f.vehicleType} onChange={(e) => set("vehicleType", e.target.value as Form["vehicleType"])}>
            <option value="any">Any / Not sure</option>
            {VEHICLE_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}{c.live ? "" : " (coming soon)"}</option>)}
          </select>
        </Field>
        <Field id="h-ac" label="AC Preference" optional>
          <select id="h-ac" className="input" value={f.acPreference} onChange={(e) => set("acPreference", e.target.value as Form["acPreference"])}>
            <option value="no-preference">No Preference</option>
            <option value="ac">AC</option>
            <option value="non-ac">Non-AC</option>
          </select>
        </Field>
      </fieldset>

      <fieldset className="mt-8 grid gap-5 sm:grid-cols-2">
        <legend className="mb-4 text-lg font-bold text-navy">Your details</legend>
        <Field id="h-name" label="Name" required error={errors.name}>
          <input {...aria("h-name", errors.name)} className="input" autoComplete="name" value={f.name} onChange={(e) => set("name", e.target.value)} maxLength={80} />
        </Field>
        <Field id="h-mobile" label="Mobile" required error={errors.mobile} hint="We'll only use this to help with your trip.">
          <input {...aria("h-mobile", errors.mobile)} type="tel" inputMode="tel" autoComplete="tel" className="input" placeholder="10-digit mobile" value={f.mobile} onChange={(e) => set("mobile", cleanPhone(e.target.value))} />
        </Field>
        <Field id="h-additional" label="Additional Requirement" optional className="sm:col-span-2">
          <textarea id="h-additional" className="input" placeholder="e.g. senior citizens travelling, luggage, pickup timing, multiple stops" value={f.additional} onChange={(e) => set("additional", e.target.value)} maxLength={1000} />
        </Field>
      </fieldset>

      {submitError && <p className="field-error mt-6 rounded-lg bg-red-50 p-3" role="alert">{submitError}</p>}

      <button type="submit" disabled={busy} className="btn btn-primary mt-8 w-full sm:w-auto sm:px-10">
        {busy ? "Submitting…" : "Submit Trip Details"}
      </button>
      <p className="mt-3 text-xs text-muted">Fields marked * are required. No login required.</p>
    </form>
  );
}
