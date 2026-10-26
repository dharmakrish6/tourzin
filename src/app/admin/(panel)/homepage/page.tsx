"use client";
import { useEffect, useState } from "react";
import { DField, Loading, useToast } from "@/components/staff/kit";
import { PageTitle } from "@/components/staff/StaffShell";
import { districtName, DISTRICTS } from "@/lib/constants";
import { db } from "@/lib/data";
import { useAsync } from "@/lib/hooks";
import { isFeaturedEligible } from "@/lib/search";
import type { SiteConfig } from "@/lib/types";

export default function HomepageConfig() {
  const { data, loading } = useAsync(async () => {
    const [cfg, ops, vehicles] = await Promise.all([db.getSiteConfig(), db.listOperators(), db.listVehicles()]);
    return { cfg, ops, vehicles };
  });
  const [c, setC] = useState<SiteConfig | null>(null);
  const [addD, setAddD] = useState("");
  const { toast, toastNode } = useToast();
  useEffect(() => { if (data) setC(data.cfg); }, [data]);
  if (loading || !data || !c) return <Loading />;

  const eligible = data.ops.filter((o) => isFeaturedEligible(o, data.vehicles, c));
  const toggleFeatured = (id: string) => {
    const on = c.featuredOperatorIds.includes(id);
    if (!on && c.featuredOperatorIds.length >= 4) return toast("Maximum 4 featured operators");
    setC({ ...c, featuredOperatorIds: on ? c.featuredOperatorIds.filter((x) => x !== id) : [...c.featuredOperatorIds, id] });
  };
  const moveD = (i: number, d: -1 | 1) => {
    const a = [...c.popularDistrictIds];
    const j = i + d;
    if (j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]];
    setC({ ...c, popularDistrictIds: a });
  };
  const save = async () => {
    await db.saveSiteConfig(c);
    // sync operator.featured flags
    for (const o of data.ops) {
      const f = c.featuredOperatorIds.includes(o.id);
      if (o.featured !== f) await db.saveOperator({ ...o, featured: f });
    }
    toast("Settings saved");
  };

  return (
    <>
      {toastNode}
      <PageTitle title="Homepage & Settings" actions={<button className="btn btn-primary btn-sm" onClick={save}>Save changes</button>} />
      <div className="grid gap-5 xl:grid-cols-2">
        <section className="card p-5">
          <h2 className="font-semibold text-navy">Featured operators ({c.featuredOperatorIds.length}/4)</h2>
          <p className="mb-3 text-xs text-muted">Only Premium + Tourzin Verified + Active operators with a public listing are eligible.</p>
          <ul className="max-h-96 space-y-1 overflow-y-auto">
            {eligible.map((o) => (
              <li key={o.id}>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-soft">
                  <input type="checkbox" className="h-4 w-4 accent-[#F47A20]" checked={c.featuredOperatorIds.includes(o.id)} onChange={() => toggleFeatured(o.id)} />
                  <span className="flex-1 text-sm font-medium">{o.name}</span>
                  <span className="text-xs text-muted">{districtName(o.primaryDistrict)}</span>
                </label>
              </li>
            ))}
            {!eligible.length && <li className="text-sm text-muted">No eligible operators.</li>}
          </ul>
        </section>
        <section className="card p-5">
          <h2 className="font-semibold text-navy">Popular districts (fixed order)</h2>
          <ol className="mt-3 space-y-1">
            {c.popularDistrictIds.map((id, i) => (
              <li key={id} className="flex items-center gap-2 rounded-lg bg-soft px-3 py-1.5 text-sm">
                <span className="w-5 text-muted">{i + 1}.</span><span className="flex-1 font-medium">{districtName(id)}</span>
                <button onClick={() => moveD(i, -1)} aria-label="Move up" className="px-1">↑</button>
                <button onClick={() => moveD(i, 1)} aria-label="Move down" className="px-1">↓</button>
                <button onClick={() => setC({ ...c, popularDistrictIds: c.popularDistrictIds.filter((x) => x !== id) })} className="text-xs text-red-700">Remove</button>
              </li>
            ))}
          </ol>
          <div className="mt-3 flex gap-2">
            <select className="input dash" value={addD} onChange={(e) => setAddD(e.target.value)} aria-label="Add district"><option value="">Add district…</option>{DISTRICTS.filter((d) => !c.popularDistrictIds.includes(d.id)).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
            <button className="btn btn-secondary btn-sm" disabled={!addD} onClick={() => { setC({ ...c, popularDistrictIds: [...c.popularDistrictIds, addD] }); setAddD(""); }}>Add</button>
          </div>
        </section>
        <section className="card grid gap-3 p-5 sm:grid-cols-2">
          <h2 className="font-semibold text-navy sm:col-span-2">Support contact</h2>
          <DField label="Support phone"><input className="input dash" value={c.supportPhone} onChange={(e) => setC({ ...c, supportPhone: e.target.value })} /></DField>
          <DField label="Support WhatsApp (with country code)"><input className="input dash" value={c.supportWhatsapp} onChange={(e) => setC({ ...c, supportWhatsapp: e.target.value })} /></DField>
          <DField label="Support email"><input className="input dash" value={c.supportEmail} onChange={(e) => setC({ ...c, supportEmail: e.target.value })} /></DField>
          <DField label="Business hours"><input className="input dash" value={c.businessHours} onChange={(e) => setC({ ...c, businessHours: e.target.value })} /></DField>
        </section>
        <section className="card grid gap-3 p-5 sm:grid-cols-2">
          <h2 className="font-semibold text-navy sm:col-span-2">Plans &amp; visibility rules</h2>
          <DField label="Base plan price (₹ / year) — not locked"><input className="input dash" inputMode="numeric" placeholder="TBD" value={c.planPricing.base ?? ""} onChange={(e) => setC({ ...c, planPricing: { ...c.planPricing, base: e.target.value ? +e.target.value.replace(/\D/g, "") : null } })} /></DField>
          <DField label="Premium plan price (₹ / year) — not locked"><input className="input dash" inputMode="numeric" placeholder="TBD" value={c.planPricing.premium ?? ""} onChange={(e) => setC({ ...c, planPricing: { ...c.planPricing, premium: e.target.value ? +e.target.value.replace(/\D/g, "") : null } })} /></DField>
          <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" className="h-4 w-4" checked={c.trialVisible} onChange={(e) => setC({ ...c, trialVisible: e.target.checked })} /> Show operators on Trial / Pending Payment publicly</label>
        </section>
      </div>
      <p className="mt-4 text-xs text-muted">Note: public pages pick up support contact changes from data at runtime only where noted; footer/contact copy is static in this MVP build.</p>
    </>
  );
}
