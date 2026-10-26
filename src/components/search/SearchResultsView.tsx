"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { track } from "@/lib/analytics";
import { categoryById, districtById, DISTRICTS, LIVE_CATEGORIES } from "@/lib/constants";
import { db } from "@/lib/data";
import { useAsync } from "@/lib/hooks";
import { searchOperators, whatsappMessage, type ResultCard } from "@/lib/search";
import type { VehicleTypeId } from "@/lib/types";
import { IconHelp, IconRefresh, IconSliders, IconX } from "../Icons";
import { OperatorCard, SkeletonCard } from "../OperatorCard";
import { SafetyModal, type ContactTarget } from "../SafetyModal";
import { buildSearchUrl, SearchForm } from "../SearchForm";
import { Notice } from "../ui";

const PAGE = 6;
const SESSION_KEY = "tourzin:last-search";

export function SearchResultsView() {
  const sp = useSearchParams();
  const router = useRouter();
  const district = sp.get("district") ?? "";
  const type = (sp.get("type") ?? "") as VehicleTypeId | "";
  const passengers = sp.get("passengers") ?? "";
  const sort = (sp.get("sort") === "most" ? "most" : "recommended") as "recommended" | "most";
  const dname = districtById(district)?.name;

  const [sheet, setSheet] = useState(false);
  const [target, setTarget] = useState<ContactTarget | null>(null);
  const [shown, setShown] = useState({ local: PAGE, serving: PAGE });

  // Restore last search for this tab if the URL lost its params
  useEffect(() => {
    if (!district) {
      try {
        const last = sessionStorage.getItem(SESSION_KEY);
        if (last) router.replace(last);
      } catch {}
    } else {
      try {
        sessionStorage.setItem(SESSION_KEY, `/search/results/?${sp.toString()}`);
      } catch {}
    }
  }, [district, sp, router]);

  const { data, error, loading, reload } = useAsync(async () => {
    if (!district) return null;
    const [ops, vehicles, cfg] = await Promise.all([db.listOperators(), db.listVehicles(), db.getSiteConfig()]);
    return searchOperators({ district, type, passengers: passengers ? +passengers : 0, sort }, ops, vehicles, cfg);
  }, [district, type, passengers, sort]);

  useEffect(() => setShown({ local: PAGE, serving: PAGE }), [district, type, passengers, sort]);

  useEffect(() => {
    if (!data) return;
    const total = data.local.length + data.serving.length;
    track("search_completed", { district, vehicle_type: type || "any", passengers: passengers || undefined, results: total });
    if (total) track("search_results_viewed", { district, local: data.local.length, serving: data.serving.length });
    else track("no_results_search", { district, vehicle_type: type || "any", passengers: passengers || undefined });
  }, [data, district, type, passengers]);

  const update = (patch: Record<string, string>) => {
    const q = new URLSearchParams(sp.toString());
    Object.entries(patch).forEach(([k, v]) => (v ? q.set(k, v) : q.delete(k)));
    router.replace(`/search/results/?${q.toString()}`, { scroll: false });
  };

  const helpUrl = useMemo(() => {
    const q = new URLSearchParams({ district, src: "no-results" });
    if (type) q.set("type", type);
    if (passengers) q.set("passengers", passengers);
    return `/let-tourzin-help/?${q.toString()}`;
  }, [district, type, passengers]);

  const openContact = (c: ResultCard, mode: "call" | "whatsapp") =>
    setTarget({
      mode,
      operatorId: c.operator.id,
      operatorName: c.operator.name,
      phone: c.operator.mobile,
      whatsapp: c.operator.whatsapp,
      district,
      message: whatsappMessage(c.operator.name, { district: dname ?? district, type, passengers: passengers ? +passengers : undefined }),
    });

  if (!district || !dname) {
    return (
      <div className="container-x py-16">
        <h1 className="h2">Search tourist vehicles</h1>
        <p className="mb-6 mt-2 text-muted">Choose a district to see available operators.</p>
        <div className="max-w-5xl"><SearchForm source="results_empty" /></div>
      </div>
    );
  }

  const summary = [type ? categoryById(type)?.name : "Any vehicle", passengers ? `${passengers} passengers` : null].filter(Boolean).join(" · ");
  const total = data ? data.local.length + data.serving.length : 0;

  const section = (key: "local" | "serving", title: string, list: ResultCard[]) => (
    <section aria-labelledby={`sec-${key}`} className="mt-8 first:mt-0">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 id={`sec-${key}`} className="text-xl font-bold text-navy">{title}</h2>
        <p className="text-sm text-muted">{list.length} {list.length === 1 ? "operator" : "operators"}</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {list.slice(0, shown[key]).map((c, i) => (
          <OperatorCard
            key={c.operator.id}
            operator={c.operator}
            photos={c.photos}
            context={{ district, section: key, position: i + 1 }}
            onContact={(m) => openContact(c, m)}
          />
        ))}
      </div>
      {list.length > shown[key] && (
        <div className="mt-6 text-center">
          <button className="btn btn-secondary" onClick={() => setShown((s) => ({ ...s, [key]: s[key] + PAGE }))}>
            Load more ({list.length - shown[key]} more)
          </button>
        </div>
      )}
    </section>
  );

  return (
    <>
      {/* Desktop sticky filter bar */}
      <div className="sticky top-16 z-30 hidden border-b border-line bg-white/95 backdrop-blur md:block lg:top-[72px]">
        <div className="container-x flex flex-wrap items-end gap-3 py-3">
          <div className="w-52">
            <label htmlFor="f-district" className="mb-1 block text-xs font-medium text-muted">District</label>
            <select id="f-district" className="input dash" value={district} onChange={(e) => update({ district: e.target.value })}>
              {DISTRICTS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="w-48">
            <label htmlFor="f-type" className="mb-1 block text-xs font-medium text-muted">Vehicle Type</label>
            <select id="f-type" className="input dash" value={type} onChange={(e) => update({ type: e.target.value })}>
              <option value="">Any Vehicle</option>
              {LIVE_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="w-36">
            <label htmlFor="f-pax" className="mb-1 block text-xs font-medium text-muted">Passengers</label>
            <input
              id="f-pax"
              className="input dash"
              inputMode="numeric"
              placeholder="Any"
              defaultValue={passengers}
              key={passengers}
              onBlur={(e) => update({ passengers: e.target.value.replace(/\D/g, "").slice(0, 3) })}
              onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
            />
          </div>
          <div className="ml-auto w-44">
            <label htmlFor="f-sort" className="mb-1 block text-xs font-medium text-muted">Sort by</label>
            <select id="f-sort" className="input dash" value={sort} onChange={(e) => update({ sort: e.target.value === "most" ? "most" : "" })}>
              <option value="recommended">Recommended</option>
              <option value="most">Most Vehicles</option>
            </select>
          </div>
        </div>
      </div>

      <div className="container-x py-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy sm:text-3xl">Tourist vehicles in {dname}</h1>
            <p className="mt-1 text-sm text-muted">{summary}{data && ` · ${total} ${total === 1 ? "operator" : "operators"}`}</p>
          </div>
          {/* Mobile controls */}
          <div className="flex gap-2 md:hidden">
            <button className="btn btn-secondary flex-1" onClick={() => setSheet(true)}>
              <IconSliders size={18} /> Edit Search
            </button>
            <label className="sr-only" htmlFor="m-sort">Sort by</label>
            <select id="m-sort" className="input w-auto flex-1" value={sort} onChange={(e) => update({ sort: e.target.value === "most" ? "most" : "" })}>
              <option value="recommended">Recommended</option>
              <option value="most">Most Vehicles</option>
            </select>
          </div>
        </div>

        {loading && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Loading results">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {error && !loading && (
          <div className="card flex flex-col items-center p-10 text-center">
            <p className="font-semibold text-navy">We couldn&apos;t load results.</p>
            <p className="mt-1 text-sm text-muted">Please check your connection and try again.</p>
            <button className="btn btn-blue mt-4" onClick={reload}><IconRefresh size={18} /> Retry</button>
          </div>
        )}

        {data && !loading && total === 0 && (
          <div className="card mx-auto max-w-2xl p-8 text-center sm:p-12">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-orange-50 text-orange"><IconHelp size={28} /></span>
            <h2 className="h2 mt-4">No operators found for this search yet</h2>
            <p className="mt-2 text-muted">
              Share your trip details and a Tourzin executive will look for suitable operators for {dname}.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href={helpUrl} className="btn btn-primary">Let Tourzin Help</Link>
              <button className="btn btn-secondary" onClick={() => (window.innerWidth < 768 ? setSheet(true) : document.getElementById("f-district")?.focus())}>
                Change Search
              </button>
            </div>
          </div>
        )}

        {data && !loading && total > 0 && (
          <>
            {data.local.length > 0 && section("local", `Operators in ${dname}`, data.local)}
            {data.local.length === 0 && data.serving.length > 0 && (
              <div className="mb-6">
                <Notice tone="warn">
                  No operators are based in {dname} for this search yet — here are operators who serve {dname}.
                </Notice>
              </div>
            )}
            {data.serving.length > 0 && section("serving", `Operators serving ${dname}`, data.serving)}

            <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-2xl bg-soft p-6 sm:flex-row sm:items-center">
              <div>
                <h2 className="h3">Didn&apos;t find the right fit?</h2>
                <p className="text-sm text-muted">Let a Tourzin executive find options for your trip.</p>
              </div>
              <Link href={helpUrl.replace("src=no-results", "src=results")} className="btn btn-secondary">Let Tourzin Help</Link>
            </div>
          </>
        )}
      </div>

      {/* Mobile bottom sheet */}
      {sheet && (
        <div className="fixed inset-0 z-50 flex items-end bg-navy/50 md:hidden animate-fade" onClick={() => setSheet(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Edit search"
            className="animate-sheet max-h-[85vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="h3">Edit Search</h2>
              <button className="grid h-10 w-10 place-items-center rounded-lg" aria-label="Close" onClick={() => setSheet(false)}><IconX /></button>
            </div>
            <SearchForm
              variant="stacked"
              source="results_edit"
              initial={{ district, type, passengers }}
              onSubmitted={(v) => {
                setSheet(false);
                router.replace(buildSearchUrl(v) + (sort === "most" ? "&sort=most" : ""));
              }}
            />
          </div>
        </div>
      )}

      {target && <SafetyModal target={target} onClose={() => setTarget(null)} />}
    </>
  );
}
