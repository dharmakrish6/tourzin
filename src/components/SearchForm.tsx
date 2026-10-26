"use client";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { track } from "@/lib/analytics";
import { DISTRICTS, LIVE_CATEGORIES } from "@/lib/constants";
import type { VehicleTypeId } from "@/lib/types";
import { IconSearch } from "./Icons";

export interface SearchValues {
  district: string;
  type: VehicleTypeId | "";
  passengers: string;
}

export function buildSearchUrl(v: SearchValues) {
  const q = new URLSearchParams();
  q.set("district", v.district);
  if (v.type) q.set("type", v.type);
  if (v.passengers) q.set("passengers", v.passengers);
  return `/search/results/?${q.toString()}`;
}

/** Homepage / Search page form: District required, Vehicle Type + Passengers optional (spec §6.1). */
export function SearchForm({
  initial,
  variant = "hero",
  source = "homepage",
  onSubmitted,
}: {
  initial?: Partial<SearchValues>;
  variant?: "hero" | "stacked";
  source?: string;
  onSubmitted?: (v: SearchValues) => void;
}) {
  const router = useRouter();
  const [v, setV] = useState<SearchValues>({ district: "", type: "", passengers: "", ...initial });
  const [err, setErr] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  const start = () => {
    if (!started && source === "homepage") track("homepage_search_started");
    setStarted(true);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!v.district) {
      setErr("Please choose a district");
      document.getElementById(`district-${variant}`)?.focus();
      return;
    }
    const pax = v.passengers ? parseInt(v.passengers, 10) : 0;
    if (v.passengers && (!pax || pax < 1 || pax > 200)) {
      setErr(null);
      return;
    }
    track("district_selected", { district: v.district, source });
    if (v.type) track("vehicle_type_selected", { vehicle_type: v.type, source });
    if (onSubmitted) onSubmitted(v);
    else router.push(buildSearchUrl(v));
  };

  const paxInvalid = !!v.passengers && (parseInt(v.passengers, 10) < 1 || parseInt(v.passengers, 10) > 200);
  const stacked = variant === "stacked";

  return (
    <form
      onSubmit={submit}
      noValidate
      onFocus={start}
      role="search"
      aria-label="Search tourist vehicles"
      className={
        stacked
          ? "grid gap-4"
          : "grid gap-3 rounded-2xl border border-line bg-white p-3 shadow-[0_8px_30px_rgba(11,39,68,0.10)] sm:p-4 md:grid-cols-[1.3fr_1.2fr_1fr_auto] md:items-end md:gap-2 md:p-2.5"
      }
    >
      <div className={stacked ? "" : "md:px-2 md:py-1"}>
        <label htmlFor={`district-${variant}`} className="label req">
          District
        </label>
        <select
          id={`district-${variant}`}
          className="input"
          value={v.district}
          aria-invalid={!!err}
          aria-describedby={err ? `district-err-${variant}` : undefined}
          required
          onChange={(e) => {
            setV({ ...v, district: e.target.value });
            setErr(null);
          }}
        >
          <option value="">Select district</option>
          {DISTRICTS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        {err && (
          <p id={`district-err-${variant}`} className="field-error">
            {err}
          </p>
        )}
      </div>
      <div className={stacked ? "" : "md:px-2 md:py-1"}>
        <label htmlFor={`type-${variant}`} className="label">
          Vehicle Type <span className="font-normal text-muted">(optional)</span>
        </label>
        <select
          id={`type-${variant}`}
          className="input"
          value={v.type}
          onChange={(e) => setV({ ...v, type: e.target.value as VehicleTypeId | "" })}
        >
          <option value="">Any Vehicle</option>
          {LIVE_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className={stacked ? "" : "md:px-2 md:py-1"}>
        <label htmlFor={`pax-${variant}`} className="label">
          Passengers <span className="font-normal text-muted">(optional)</span>
        </label>
        <input
          id={`pax-${variant}`}
          className="input"
          type="number"
          inputMode="numeric"
          min={1}
          max={200}
          placeholder="e.g. 14"
          value={v.passengers}
          aria-invalid={paxInvalid}
          onChange={(e) => setV({ ...v, passengers: e.target.value.replace(/[^0-9]/g, "").slice(0, 3) })}
        />
        {paxInvalid && <p className="field-error">Enter a number between 1 and 200</p>}
      </div>
      <button type="submit" className={`btn btn-primary ${stacked ? "w-full" : "md:min-h-12 md:px-6"}`}>
        <IconSearch size={18} /> Search Vehicles
      </button>
    </form>
  );
}
