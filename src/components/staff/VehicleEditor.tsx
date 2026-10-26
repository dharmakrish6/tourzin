"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { DISTRICTS, VEHICLE_CATEGORIES, VEHICLE_STATUS_LABEL } from "@/lib/constants";
import { db } from "@/lib/data";
import { useAsync } from "@/lib/hooks";
import type { Vehicle } from "@/lib/types";
import { DField, Empty, Loading, useToast } from "./kit";
import { PageTitle } from "./StaffShell";

const MIN_W = 800, MIN_H = 500, MAX_MB = 10;
const OK_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Automated technical validation (spec §10.3, §11): rejects unsupported, corrupt or
 * below-minimum-dimension files. In Firebase mode the original is uploaded to Storage and
 * a Cloud Function generates smart-cropped S/M/L WebP renditions with the public watermark.
 */
function validateImage(file: File): Promise<{ ok: true; url: string } | { ok: false; reason: string }> {
  return new Promise((resolve) => {
    if (!OK_TYPES.includes(file.type)) return resolve({ ok: false, reason: `${file.name}: unsupported format (use JPG, PNG or WebP)` });
    if (file.size > MAX_MB * 1024 * 1024) return resolve({ ok: false, reason: `${file.name}: larger than ${MAX_MB}MB` });
    const reader = new FileReader();
    reader.onerror = () => resolve({ ok: false, reason: `${file.name}: could not be read` });
    reader.onload = () => {
      const url = String(reader.result);
      const img = new Image();
      img.onerror = () => resolve({ ok: false, reason: `${file.name}: file appears to be corrupt` });
      img.onload = () => {
        if (img.naturalWidth < MIN_W || img.naturalHeight < MIN_H)
          return resolve({ ok: false, reason: `${file.name}: ${img.naturalWidth}×${img.naturalHeight}px is below the ${MIN_W}×${MIN_H}px minimum` });
        // Downscale for demo storage (mock mode keeps images in localStorage)
        const scale = Math.min(1, 1200 / img.naturalWidth);
        const c = document.createElement("canvas");
        c.width = Math.round(img.naturalWidth * scale);
        c.height = Math.round(img.naturalHeight * scale);
        c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
        resolve({ ok: true, url: c.toDataURL("image/webp", 0.8) });
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  });
}

export function VehicleEditor() {
  const sp = useSearchParams();
  const id = sp.get("id") ?? "new";
  const router = useRouter();
  const { toast, toastNode } = useToast();
  const { data, loading } = useAsync(async () => {
    const [vs, ops] = await Promise.all([db.listVehicles(), db.listOperators()]);
    return { vs, ops };
  }, [id]);
  const [v, setV] = useState<Vehicle | null>(null);
  const [errs, setErrs] = useState<string[]>([]);
  const [imgErrs, setImgErrs] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState("");

  useEffect(() => {
    if (!data) return;
    if (id === "new") {
      const op = data.ops.find((o) => o.id === sp.get("operator"));
      setV({ id: "", operatorId: op?.id ?? "", type: "tempo-traveller", model: "", seats: 12, ac: true, district: op?.primaryDistrict ?? "", serviceAreas: op?.serviceAreas ?? [], photos: [], status: "draft", verified: false, internalNotes: "" });
    } else setV(data.vs.find((x) => x.id === id) ?? null);
  }, [data, id, sp]);

  if (loading || !data) return <Loading />;
  if (!v) return <Empty>Vehicle not found.</Empty>;
  const set = <K extends keyof Vehicle>(k: K, val: Vehicle[K]) => setV({ ...v, [k]: val });

  const onFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = [...(e.target.files ?? [])];
    e.target.value = "";
    const results = await Promise.all(files.map(validateImage));
    setImgErrs(results.filter((r) => !r.ok).map((r) => (r as { reason: string }).reason));
    const good = results.filter((r) => r.ok).map((r) => (r as { url: string }).url);
    if (good.length) setV((p) => (p ? { ...p, photos: [...p.photos, ...good] } : p));
  };

  const activationProblems = (x: Vehicle) => {
    const p: string[] = [];
    if (!x.operatorId) p.push("Linked operator");
    if (!x.model.trim()) p.push("Model / name");
    if (!x.seats) p.push("Seating capacity");
    if (!x.district) p.push("District");
    if (x.photos.length < 3) p.push(`At least 3 photos (exterior, interior/seating, 1 more) — has ${x.photos.length}`);
    return p;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const base: string[] = [];
    if (!v.operatorId) base.push("Choose the operator");
    if (!v.model.trim()) base.push("Model / name is required");
    if (v.status === "active") activationProblems(v).forEach((p) => base.push(`Cannot activate — missing: ${p}`));
    setErrs([...new Set(base)]);
    if (base.length) return;
    const final = { ...v, id: v.id || `${v.operatorId}-v${Date.now().toString(36).slice(-5)}` };
    await db.saveVehicle(final);
    toast("Vehicle saved");
    if (!v.id) router.replace(`/admin/vehicles/edit/?id=${final.id}`);
  };

  const problems = activationProblems(v);
  const move = (i: number, d: -1 | 1) => {
    const p = [...v.photos];
    const j = i + d;
    if (j < 0 || j >= p.length) return;
    [p[i], p[j]] = [p[j], p[i]];
    set("photos", p);
  };

  return (
    <>
      {toastNode}
      <div className="mb-4 text-sm"><Link href="/admin/vehicles/" className="text-blue hover:underline">← Vehicles</Link></div>
      <PageTitle title={v.id ? v.model : "New vehicle"} />
      <form onSubmit={submit} className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <section className="card grid gap-3 p-5 sm:grid-cols-2">
            <DField label="Operator *">
              <select className="input dash" value={v.operatorId} onChange={(e) => { const op = data.ops.find((o) => o.id === e.target.value); setV({ ...v, operatorId: e.target.value, district: op?.primaryDistrict ?? v.district, serviceAreas: op?.serviceAreas ?? v.serviceAreas }); }}>
                <option value="">Select operator</option>{data.ops.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </DField>
            <DField label="Vehicle type *">
              <select className="input dash" value={v.type} onChange={(e) => set("type", e.target.value as Vehicle["type"])}>{VEHICLE_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}{c.live ? "" : " (planned)"}</option>)}</select>
            </DField>
            <DField label="Model / name *"><input className="input dash" value={v.model} onChange={(e) => set("model", e.target.value)} /></DField>
            <DField label="Seating capacity *"><input className="input dash" inputMode="numeric" value={v.seats || ""} onChange={(e) => set("seats", +e.target.value.replace(/\D/g, "") || 0)} /></DField>
            <DField label="AC / Non-AC"><select className="input dash" value={v.ac ? "ac" : "non"} onChange={(e) => set("ac", e.target.value === "ac")}><option value="ac">AC</option><option value="non">Non-AC</option></select></DField>
            <DField label="District *"><select className="input dash" value={v.district} onChange={(e) => set("district", e.target.value)}><option value="">Select</option>{DISTRICTS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></DField>
            <DField label="Internal notes" className="sm:col-span-2"><input className="input dash" value={v.internalNotes} onChange={(e) => set("internalNotes", e.target.value)} /></DField>
          </section>

          <section className="card p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold text-navy">Photos ({v.photos.length}/3 minimum)</h2>
              <label className="btn btn-secondary btn-sm cursor-pointer">
                Upload photos
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={onFiles} />
              </label>
            </div>
            <p className="mb-3 text-xs text-muted">Order: 1) clear exterior, 2) interior / seating, 3) another clear vehicle photo. JPG/PNG/WebP, min {MIN_W}×{MIN_H}px, max {MAX_MB}MB. The first photo is the large image on search cards.</p>
            {imgErrs.length > 0 && <ul className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{imgErrs.map((x) => <li key={x}>✕ {x}</li>)}</ul>}
            {v.photos.length ? (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {v.photos.map((p, i) => (
                  <li key={i} className="overflow-hidden rounded-lg border border-line">
                    <div className="relative">
                      <img src={p} alt={`Photo ${i + 1}`} className="aspect-[4/3] w-full object-cover" />
                      <span className="absolute left-1.5 top-1.5 rounded bg-navy/80 px-1.5 text-xs font-semibold text-white">{i + 1}</span>
                    </div>
                    <div className="flex justify-between p-1.5 text-xs">
                      <span className="flex gap-1">
                        <button type="button" onClick={() => move(i, -1)} className="rounded px-1.5 hover:bg-soft" aria-label="Move left">←</button>
                        <button type="button" onClick={() => move(i, 1)} className="rounded px-1.5 hover:bg-soft" aria-label="Move right">→</button>
                      </span>
                      <button type="button" onClick={() => set("photos", v.photos.filter((_, j) => j !== i))} className="text-red-700 hover:underline">Remove</button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : <Empty>No photos yet.</Empty>}
            <div className="mt-3 flex gap-2">
              <input className="input dash" placeholder="…or paste an image URL" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} aria-label="Image URL" />
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => { if (urlInput.trim()) { set("photos", [...v.photos, urlInput.trim()]); setUrlInput(""); } }}>Add</button>
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="card space-y-3 p-5">
            <DField label="Vehicle status">
              <select className="input dash" value={v.status} onChange={(e) => set("status", e.target.value as Vehicle["status"])}>{Object.entries(VEHICLE_STATUS_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
            </DField>
            <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" className="h-4 w-4" checked={v.verified} onChange={(e) => set("verified", e.target.checked)} /> Vehicle verified</label>
            <div className="rounded-lg bg-soft p-3 text-xs">
              <p className="mb-1 font-semibold text-navy">Activation checklist</p>
              {problems.length ? <ul className="space-y-0.5 text-red-700">{problems.map((p) => <li key={p}>✕ {p}</li>)}</ul> : <p className="text-success">✓ Ready — confirm admin visual review before setting Active.</p>}
            </div>
          </section>
          {errs.length > 0 && <ul className="rounded-xl bg-red-50 p-4 text-sm text-red-700" role="alert">{errs.map((x) => <li key={x}>• {x}</li>)}</ul>}
          <button className="btn btn-primary w-full">Save vehicle</button>
          {v.id && <button type="button" className="btn btn-danger btn-sm w-full" onClick={async () => { if (confirm("Delete this vehicle?")) { await db.deleteVehicle(v.id); router.replace("/admin/vehicles/"); } }}>Delete vehicle</button>}
        </aside>
      </form>
    </>
  );
}
