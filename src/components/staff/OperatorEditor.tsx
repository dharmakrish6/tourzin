"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { categoryById, DISTRICTS, districtName, OPERATOR_STATUS_LABEL, SUBSCRIPTION_STATUS_LABEL, VEHICLE_STATUS_LABEL } from "@/lib/constants";
import { db } from "@/lib/data";
import { useAsync } from "@/lib/hooks";
import { effectiveSubscription, formatINR, isFeaturedEligible, isPubliclyListed } from "@/lib/search";
import type { Operator } from "@/lib/types";
import { DField, Empty, fmtDate, Loading, Pill, toneFor, useToast } from "./kit";
import { PageTitle } from "./StaffShell";
import { PaymentForm } from "./PaymentForm";

const blank = (): Operator => {
  const t = new Date().toISOString().slice(0, 10);
  const y = new Date();
  y.setFullYear(y.getFullYear() + 1);
  return {
    id: "", name: "", contactPerson: "", mobile: "", whatsapp: "", primaryDistrict: "", serviceAreas: [], totalFleet: 0, approxDailyPrice: null,
    plan: "base", subscriptionStatus: "trial", subscriptionStart: t, subscriptionExpiry: y.toISOString().slice(0, 10), visibilityOverride: "auto",
    verified: false, status: "new-lead", joinDate: t, featured: false, internalNotes: "",
  };
};

export function OperatorEditor() {
  const sp = useSearchParams();
  const id = sp.get("id") ?? "new";
  const leadId = sp.get("lead");
  const router = useRouter();
  const { toast, toastNode } = useToast();
  const { data, loading, reload } = useAsync(async () => {
    const [ops, vehicles, payments, cfg, leads] = await Promise.all([db.listOperators(), db.listVehicles(), db.listPayments(), db.getSiteConfig(), db.listLeads()]);
    return { ops, vehicles, payments, cfg, leads };
  }, [id]);
  const [op, setOp] = useState<Operator | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [payOpen, setPayOpen] = useState(false);

  useEffect(() => {
    if (!data) return;
    if (id === "new") {
      const b = blank();
      const lead = leadId ? data.leads.find((l) => l.id === leadId) : null;
      if (lead) Object.assign(b, { name: lead.companyName, contactPerson: lead.contactPerson, mobile: lead.mobile, whatsapp: lead.whatsapp, primaryDistrict: lead.district, status: "contacted", internalNotes: `From lead: fleet ${lead.fleetSize}, types ${lead.vehicleTypes.join(", ")}` });
      setOp(b);
    } else setOp(data.ops.find((o) => o.id === id) ?? null);
  }, [data, id, leadId]);

  if (loading || !data) return <Loading />;
  if (!op) return <Empty>Operator not found.</Empty>;

  const set = <K extends keyof Operator>(k: K, v: Operator[K]) => setOp({ ...op, [k]: v });
  const vehicles = data.vehicles.filter((v) => v.operatorId === op.id);
  const payments = data.payments.filter((p) => p.operatorId === op.id).sort((a, b) => b.date.localeCompare(a.date));
  const listed = op.id ? isPubliclyListed(op, data.vehicles, data.cfg) : false;
  const eligibleFeature = isFeaturedEligible(op, data.vehicles, data.cfg);
  const sub = effectiveSubscription(op);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: string[] = [];
    if (!op.name.trim()) errs.push("Operator / company name is required");
    if (!/^\d{10}$/.test(op.mobile)) errs.push("Mobile must be 10 digits");
    if (op.whatsapp && !/^\d{10}$/.test(op.whatsapp)) errs.push("WhatsApp must be 10 digits");
    if (!op.primaryDistrict) errs.push("Primary district is required");
    if (op.featured && !(op.plan === "premium" && op.verified && op.status === "active")) errs.push("Featured requires Premium + Tourzin Verified + Active");
    setErrors(errs);
    if (errs.length) return;
    const final: Operator = { ...op, id: op.id || `op-${op.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now().toString(36).slice(-4)}`, whatsapp: op.whatsapp || op.mobile };
    // keep fleet count in sync if not manually set
    if (!final.totalFleet) final.totalFleet = vehicles.length;
    await db.saveOperator(final);
    // keep homepage featured list consistent
    const cfg = data.cfg;
    const inList = cfg.featuredOperatorIds.includes(final.id);
    if (final.featured && !inList && cfg.featuredOperatorIds.length < 4) await db.saveSiteConfig({ ...cfg, featuredOperatorIds: [...cfg.featuredOperatorIds, final.id] });
    if (!final.featured && inList) await db.saveSiteConfig({ ...cfg, featuredOperatorIds: cfg.featuredOperatorIds.filter((x) => x !== final.id) });
    if (leadId) {
      const lead = data.leads.find((l) => l.id === leadId);
      if (lead) await db.saveLead({ ...lead, handled: true });
    }
    toast("Operator saved");
    if (!op.id) router.replace(`/admin/operators/edit/?id=${final.id}`);
    else reload();
  };

  const toggleArea = (d: string) => set("serviceAreas", op.serviceAreas.includes(d) ? op.serviceAreas.filter((x) => x !== d) : [...op.serviceAreas, d]);

  return (
    <>
      {toastNode}
      <div className="mb-4 text-sm"><Link href="/admin/operators/" className="text-blue hover:underline">← Operators</Link></div>
      <PageTitle
        title={op.id ? op.name : "New operator"}
        sub={op.id ? `Joined ${fmtDate(op.joinDate)}` : leadId ? "Converting an operator lead" : undefined}
        actions={op.id ? <>{listed ? <Pill tone="green">Publicly visible</Pill> : <Pill tone="gray">Hidden from public</Pill>}</> : undefined}
      />

      <form onSubmit={submit} className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <section className="card grid gap-3 p-5 sm:grid-cols-2">
            <h2 className="font-semibold text-navy sm:col-span-2">Profile</h2>
            <DField label="Operator / Company name *"><input className="input dash" value={op.name} onChange={(e) => set("name", e.target.value)} /></DField>
            <DField label="Contact person"><input className="input dash" value={op.contactPerson} onChange={(e) => set("contactPerson", e.target.value)} /></DField>
            <DField label="Mobile *"><input className="input dash" inputMode="numeric" value={op.mobile} onChange={(e) => set("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))} /></DField>
            <DField label="WhatsApp"><input className="input dash" inputMode="numeric" value={op.whatsapp} placeholder="Same as mobile" onChange={(e) => set("whatsapp", e.target.value.replace(/\D/g, "").slice(0, 10))} /></DField>
            <DField label="Primary district *">
              <select className="input dash" value={op.primaryDistrict} onChange={(e) => set("primaryDistrict", e.target.value)}><option value="">Select</option>{DISTRICTS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
            </DField>
            <DField label="Total fleet count">
              <input className="input dash" inputMode="numeric" value={op.totalFleet || ""} placeholder={String(vehicles.length)} onChange={(e) => set("totalFleet", +e.target.value.replace(/\D/g, "") || 0)} />
            </DField>
            <DField label="Approx. daily price (₹, optional — never used for ranking)">
              <input className="input dash" inputMode="numeric" value={op.approxDailyPrice ?? ""} placeholder="Hidden if empty" onChange={(e) => set("approxDailyPrice", e.target.value ? +e.target.value.replace(/\D/g, "") : null)} />
            </DField>
            <DField label="Join date"><input type="date" className="input dash" value={op.joinDate} onChange={(e) => set("joinDate", e.target.value)} /></DField>
            <div className="sm:col-span-2">
              <span className="mb-1 block text-xs font-semibold text-muted">Service areas ({op.serviceAreas.length})</span>
              <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto rounded-lg border border-line p-2">
                {DISTRICTS.filter((d) => d.id !== op.primaryDistrict).map((d) => {
                  const on = op.serviceAreas.includes(d.id);
                  return (
                    <button type="button" key={d.id} onClick={() => toggleArea(d.id)} aria-pressed={on} className={`rounded-full border px-2.5 py-1 text-xs ${on ? "border-blue bg-blue-50 text-blue" : "border-line text-muted hover:bg-soft"}`}>{d.name}</button>
                  );
                })}
              </div>
            </div>
            <DField label="Internal notes (private)" className="sm:col-span-2"><textarea className="input dash min-h-20 py-2" value={op.internalNotes} onChange={(e) => set("internalNotes", e.target.value)} /></DField>
          </section>

          {op.id && (
            <section className="card overflow-hidden">
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <h2 className="font-semibold text-navy">Vehicles ({vehicles.length})</h2>
                <Link href={`/admin/vehicles/edit/?id=new&operator=${op.id}`} className="btn btn-secondary btn-sm">+ Add vehicle</Link>
              </div>
              {vehicles.length ? (
                <table className="tbl">
                  <thead><tr><th>Vehicle</th><th>Seats</th><th>AC</th><th>Photos</th><th>Status</th></tr></thead>
                  <tbody>
                    {vehicles.map((v) => (
                      <tr key={v.id}>
                        <td><Link href={`/admin/vehicles/edit/?id=${v.id}`} className="font-medium text-blue hover:underline">{v.model}</Link><div className="text-xs text-muted">{categoryById(v.type)?.name}</div></td>
                        <td>{v.seats}</td><td>{v.ac ? "AC" : "Non-AC"}</td>
                        <td className={v.photos.length < 3 ? "font-semibold text-red-700" : ""}>{v.photos.length}</td>
                        <td><Pill tone={toneFor(v.status)}>{VEHICLE_STATUS_LABEL[v.status]}</Pill></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <p className="p-4 text-sm text-muted">No vehicles yet. At least one Active vehicle with 3+ photos is needed for public listing.</p>}
            </section>
          )}

          {op.id && (
            <section className="card overflow-hidden">
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <h2 className="font-semibold text-navy">Payment history</h2>
                <button type="button" onClick={() => setPayOpen(true)} className="btn btn-secondary btn-sm">+ Record payment</button>
              </div>
              {payments.length ? (
                <table className="tbl">
                  <thead><tr><th>Date</th><th>Amount</th><th>Mode</th><th>Reference</th><th>Period</th><th>Plan</th></tr></thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id}><td>{fmtDate(p.date)}</td><td className="font-semibold">{formatINR(p.amount)}</td><td className="capitalize">{p.mode.replace("-", " ")}</td><td className="text-muted">{p.reference}</td><td className="text-xs">{fmtDate(p.periodStart)} – {fmtDate(p.periodEnd)}</td><td className="capitalize">{p.plan}{p.renewal && " · renewal"}</td></tr>
                    ))}
                  </tbody>
                </table>
              ) : <p className="p-4 text-sm text-muted">No payments recorded.</p>}
            </section>
          )}
        </div>

        <aside className="space-y-5">
          <section className="card space-y-3 p-5">
            <h2 className="font-semibold text-navy">Status &amp; verification</h2>
            <DField label="Operator status">
              <select className="input dash" value={op.status} onChange={(e) => set("status", e.target.value as Operator["status"])}>{Object.entries(OPERATOR_STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
            </DField>
            <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" className="h-4 w-4 accent-[#2E7D32]" checked={op.verified} onChange={(e) => set("verified", e.target.checked)} /> Tourzin Verified (formal verification complete)</label>
          </section>
          <section className="card space-y-3 p-5">
            <h2 className="font-semibold text-navy">Subscription</h2>
            <DField label="Plan">
              <select className="input dash" value={op.plan} onChange={(e) => set("plan", e.target.value as Operator["plan"])}><option value="base">Base</option><option value="premium">Premium</option></select>
            </DField>
            <DField label="Subscription status">
              <select className="input dash" value={op.subscriptionStatus} onChange={(e) => set("subscriptionStatus", e.target.value as Operator["subscriptionStatus"])}>{Object.entries(SUBSCRIPTION_STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
            </DField>
            <p className="text-xs text-muted">Effective: <Pill tone={toneFor(sub)}>{SUBSCRIPTION_STATUS_LABEL[sub]}</Pill></p>
            <div className="grid grid-cols-2 gap-2">
              <DField label="Start"><input type="date" className="input dash" value={op.subscriptionStart} onChange={(e) => set("subscriptionStart", e.target.value)} /></DField>
              <DField label="Expiry"><input type="date" className="input dash" value={op.subscriptionExpiry} onChange={(e) => set("subscriptionExpiry", e.target.value)} /></DField>
            </div>
            <DField label="Visibility override">
              <select className="input dash" value={op.visibilityOverride} onChange={(e) => set("visibilityOverride", e.target.value as Operator["visibilityOverride"])}>
                <option value="auto">Automatic rules</option><option value="force-show">Force show</option><option value="force-hide">Force hide</option>
              </select>
            </DField>
          </section>
          <section className="card space-y-2 p-5">
            <h2 className="font-semibold text-navy">Homepage</h2>
            <label className={`flex items-center gap-2 text-sm font-medium ${!eligibleFeature && !op.featured ? "opacity-60" : ""}`}>
              <input type="checkbox" className="h-4 w-4 accent-[#F47A20]" checked={op.featured} disabled={!eligibleFeature && !op.featured} onChange={(e) => set("featured", e.target.checked)} /> Featured on homepage
            </label>
            <p className="text-xs text-muted">Eligible only when Premium + Tourzin Verified + Active (and publicly listed). Max 4 featured.</p>
          </section>
          {errors.length > 0 && <ul className="rounded-xl bg-red-50 p-4 text-sm text-red-700" role="alert">{errors.map((e) => <li key={e}>• {e}</li>)}</ul>}
          <button className="btn btn-primary w-full">Save operator</button>
          {op.id && (
            <button
              type="button"
              className="btn btn-danger btn-sm w-full"
              onClick={async () => {
                if (!confirm(`Delete ${op.name} and its vehicles? (Prefer setting status to Paused/Rejected.)`)) return;
                await db.deleteOperator(op.id);
                router.replace("/admin/operators/");
              }}
            >
              Delete operator
            </button>
          )}
          {op.id && <p className="text-xs text-muted">Primary: {districtName(op.primaryDistrict)} · ID {op.id}</p>}
        </aside>
      </form>
      {payOpen && <PaymentForm operator={op} onClose={() => setPayOpen(false)} onSaved={() => { setPayOpen(false); toast("Payment recorded"); reload(); }} />}
    </>
  );
}
