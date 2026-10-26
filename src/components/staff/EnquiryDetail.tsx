"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { track } from "@/lib/analytics";
import {
  AVAILABILITY_LABEL, categoryById, districtName, DISTRICTS, ENQUIRY_STATUS_LABEL, EXCEPTIONS, PIPELINE, VEHICLE_CATEGORIES,
} from "@/lib/constants";
import { db } from "@/lib/data";
import { useAsync } from "@/lib/hooks";
import { formatINR, isPubliclyListed, PLAN_GROUP_LABEL, planGroup, searchOperators } from "@/lib/search";
import type { AvailabilityStatus, Enquiry, EnquiryStatus, Operator } from "@/lib/types";
import { IconCheck, IconCopy, IconPhone, IconWhatsApp } from "../Icons";
import { VerifiedBadge } from "../ui";
import { DField, Empty, fmtDate, fmtDateTime, Loading, Modal, Pill, toneFor, useToast } from "./kit";
import { useStaff } from "./StaffShell";

export function EnquiryDetail() {
  const id = useSearchParams().get("id") ?? "";
  const me = useStaff();
  const { toast, toastNode } = useToast();
  const { data, loading, setData } = useAsync(async () => {
    const [enq, ops, vehicles, cfg, staff] = await Promise.all([db.getEnquiry(id), db.listOperators(), db.listVehicles(), db.getSiteConfig(), db.listStaff()]);
    return { enq, ops, vehicles, cfg, staff };
  }, [id]);
  const [note, setNote] = useState("");
  const [editReq, setEditReq] = useState(false);
  const [pickOp, setPickOp] = useState("");

  const suggestions = useMemo(() => {
    if (!data?.enq) return [];
    const e = data.enq;
    const r = searchOperators(
      { district: e.district, type: e.vehicleType === "any" || !categoryById(e.vehicleType)?.live ? "" : e.vehicleType, passengers: e.passengers },
      data.ops, data.vehicles, data.cfg
    );
    return [...r.local, ...r.serving].filter((c) => !e.matches.some((m) => m.operatorId === c.operator.id)).slice(0, 8);
  }, [data]);

  if (loading) return <Loading />;
  if (!data?.enq) return <Empty>Enquiry not found. <Link href="/executive/inbox/" className="text-blue underline">Back to inbox</Link></Empty>;

  const e = data.enq;
  const opById = (oid: string) => data.ops.find((o) => o.id === oid);

  const save = async (next: Enquiry, log?: string, msg = "Saved") => {
    const withLog = log ? { ...next, activity: [...next.activity, { at: new Date().toISOString(), by: me.name, text: log }] } : next;
    setData({ ...data, enq: withLog });
    await db.saveEnquiry(withLog);
    toast(msg);
  };

  const setStatus = (s: EnquiryStatus, extra: Partial<Enquiry> = {}) => {
    if (s === e.status) return;
    save({ ...e, ...extra, status: s }, `Status → ${ENQUIRY_STATUS_LABEL[s]}`, `Status: ${ENQUIRY_STATUS_LABEL[s]}`);
    if (["booked", "not-booked", "cancelled"].includes(s)) track("enquiry_outcome", { enquiry_id: e.id, outcome: s, operator_id: extra.selectedOperatorId ?? e.selectedOperatorId });
  };

  const addMatch = (op: Operator) => {
    save(
      { ...e, matches: [...e.matches, { operatorId: op.id, availability: "pending", quote: "", inOptions: false, note: "" }], status: PIPELINE.indexOf(e.status) < 2 ? "matching" : e.status },
      `Added ${op.name} to matches`,
      "Operator added"
    );
  };
  const updMatch = (oid: string, patch: Partial<Enquiry["matches"][number]>, log?: string) =>
    save({ ...e, matches: e.matches.map((m) => (m.operatorId === oid ? { ...m, ...patch } : m)) }, log);

  const optionList = e.matches.filter((m) => m.inOptions);
  const optionsText =
    `Hi ${e.name}, here are suitable options for your trip from ${districtName(e.district)} to ${e.destination} on ${fmtDate(e.travelDate)} (${e.passengers} passengers):\n\n` +
    optionList
      .map((m, i) => {
        const op = opById(m.operatorId);
        return `${i + 1}. ${op?.name ?? m.operatorId} (${districtName(op?.primaryDistrict ?? "")})${m.quote ? `\n   Quote: ${m.quote}` : ""}`;
      })
      .join("\n\n") +
    `\n\nThese quotes are provided by the operators. Please let us know which option you'd like and we'll connect you. — Team Tourzin`;

  const stepIndex = PIPELINE.indexOf(e.status);
  const closed = !PIPELINE.includes(e.status);

  return (
    <>
      {toastNode}
      <div className="mb-4 text-sm"><Link href="/executive/inbox/" className="text-blue hover:underline">← Inbox</Link></div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-navy">{e.id}</h1>
          <Pill tone={toneFor(e.status)}>{ENQUIRY_STATUS_LABEL[e.status]}</Pill>
          {e.sourceNote && <Pill tone="orange">{e.sourceNote}</Pill>}
        </div>
        <p className="text-sm text-muted">Received {fmtDateTime(e.createdAt)} via {e.source.replace("-", " ")}</p>
      </div>

      {/* Pipeline stepper */}
      <div className="card mb-5 overflow-x-auto p-3">
        <ol className="flex min-w-[860px] items-center gap-1">
          {PIPELINE.map((s, i) => (
            <li key={s} className="flex flex-1 items-center gap-1">
              <button
                onClick={() => setStatus(s)}
                className={`flex w-full items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold transition-colors ${
                  e.status === s ? "bg-blue text-white" : !closed && i < stepIndex ? "bg-blue-50 text-blue" : "bg-soft text-muted hover:bg-line/60"
                }`}
              >
                {!closed && i < stepIndex && <IconCheck size={13} />} {ENQUIRY_STATUS_LABEL[s]}
              </button>
            </li>
          ))}
        </ol>
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3 text-sm">
          <span className="font-semibold text-navy">Outcome:</span>
          <button onClick={() => setStatus("booked")} className={`btn btn-sm ${e.status === "booked" ? "bg-success text-white" : "btn-secondary"}`}>Booked</button>
          <button onClick={() => setStatus("not-booked")} className={`btn btn-sm ${e.status === "not-booked" ? "bg-red-700 text-white" : "btn-secondary"}`}>Not Booked</button>
          <span className="ml-2 font-semibold text-navy">Exception:</span>
          <select className="input dash w-auto" value={EXCEPTIONS.includes(e.status) ? e.status : ""} onChange={(ev) => ev.target.value && setStatus(ev.target.value as EnquiryStatus)} aria-label="Exception status">
            <option value="">— none —</option>
            {EXCEPTIONS.map((x) => <option key={x} value={x}>{ENQUIRY_STATUS_LABEL[x]}</option>)}
          </select>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          {/* Requirement */}
          <section className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-navy">Customer &amp; trip requirement</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditReq(true)}>Edit</button>
            </div>
            <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
              {[
                ["Customer", e.name],
                ["Mobile", <a key="m" href={`tel:+91${e.mobile}`} className="text-blue hover:underline">{e.mobile}</a>],
                ["Pickup district", districtName(e.district)],
                ["Destination", e.destination],
                ["Travel date", fmtDate(e.travelDate)],
                ["Return date", e.returnDate ? fmtDate(e.returnDate) : "—"],
                ["Passengers", e.passengers],
                ["Vehicle type", e.vehicleType === "any" ? "Any / Not sure" : categoryById(e.vehicleType)?.name],
                ["AC preference", { "no-preference": "No preference", ac: "AC", "non-ac": "Non-AC" }[e.acPreference]],
              ].map(([k, v]) => (
                <div key={k as string}><dt className="text-xs text-muted">{k}</dt><dd className="font-medium">{v}</dd></div>
              ))}
              {e.additional && <div className="sm:col-span-3"><dt className="text-xs text-muted">Additional requirement</dt><dd>{e.additional}</dd></div>}
            </dl>
            <div className="mt-4 flex gap-2">
              <a href={`tel:+91${e.mobile}`} className="btn btn-secondary btn-sm"><IconPhone size={16} /> Call customer</a>
              <a href={`https://wa.me/91${e.mobile}`} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-sm"><IconWhatsApp size={16} /> WhatsApp</a>
            </div>
          </section>

          {/* Matching + availability */}
          <section className="card p-5">
            <h2 className="mb-1 font-semibold text-navy">Matching &amp; availability</h2>
            <p className="mb-4 text-xs text-muted">Add suitable operators, record their availability and quote, and tick those to include in the customer&apos;s options.</p>
            {e.matches.length ? (
              <div className="space-y-3">
                {e.matches.map((m) => {
                  const op = opById(m.operatorId);
                  return (
                    <div key={m.operatorId} className="rounded-xl border border-line p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-semibold text-navy">{op?.name ?? m.operatorId} {op?.verified && <VerifiedBadge small />}</p>
                          <p className="text-xs text-muted">{districtName(op?.primaryDistrict ?? "")} · {op?.totalFleet} vehicles · {op ? PLAN_GROUP_LABEL[planGroup(op)] : ""}{op?.approxDailyPrice ? ` · Approx. ${formatINR(op.approxDailyPrice)}/day` : ""}</p>
                        </div>
                        <div className="flex gap-1.5">
                          {op && <a href={`tel:+91${op.mobile}`} className="btn btn-secondary btn-sm" title={op.mobile}><IconPhone size={15} /> {op.mobile}</a>}
                          {op && <a href={`https://wa.me/91${op.whatsapp}?text=${encodeURIComponent(`Hi ${op.contactPerson}, Tourzin enquiry ${e.id}: ${e.passengers} pax, ${districtName(e.district)} → ${e.destination}, ${fmtDate(e.travelDate)}${e.returnDate ? " to " + fmtDate(e.returnDate) : ""}. ${e.vehicleType !== "any" ? categoryById(e.vehicleType)?.name + ". " : ""}Is a vehicle available? Please share your quote.`)}`} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-sm" aria-label="WhatsApp operator"><IconWhatsApp size={15} /></a>}
                        </div>
                      </div>
                      <div className="mt-3 grid gap-2 sm:grid-cols-[200px_1fr_1fr_auto] sm:items-end">
                        <DField label="Availability">
                          <select className="input dash" value={m.availability} onChange={(ev) => updMatch(m.operatorId, { availability: ev.target.value as AvailabilityStatus }, `${op?.name}: ${AVAILABILITY_LABEL[ev.target.value as AvailabilityStatus]}`)}>
                            {Object.entries(AVAILABILITY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                          </select>
                        </DField>
                        <DField label="Operator quote / details"><input className="input dash" defaultValue={m.quote} placeholder="e.g. ₹9,000/day, toll extra" onBlur={(ev) => ev.target.value !== m.quote && updMatch(m.operatorId, { quote: ev.target.value }, `${op?.name}: quote updated`)} /></DField>
                        <DField label="Internal note"><input className="input dash" defaultValue={m.note} onBlur={(ev) => ev.target.value !== m.note && updMatch(m.operatorId, { note: ev.target.value })} /></DField>
                        <div className="flex items-center gap-3 pb-1.5">
                          <label className="flex items-center gap-1.5 text-sm font-medium"><input type="checkbox" className="h-4 w-4 accent-[#1769AA]" checked={m.inOptions} onChange={(ev) => updMatch(m.operatorId, { inOptions: ev.target.checked })} /> In options</label>
                          <button className="text-xs text-red-700 hover:underline" onClick={() => save({ ...e, matches: e.matches.filter((x) => x.operatorId !== m.operatorId) }, `Removed ${op?.name}`)}>Remove</button>
                        </div>
                      </div>
                      <Pill tone={toneFor(m.availability)}>{AVAILABILITY_LABEL[m.availability]}</Pill>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Empty>No operators matched yet.</Empty>
            )}

            <div className="mt-5 border-t border-line pt-4">
              <h3 className="mb-2 text-sm font-semibold text-navy">Suggested operators</h3>
              {suggestions.length ? (
                <ul className="grid gap-2 sm:grid-cols-2">
                  {suggestions.map((c) => (
                    <li key={c.operator.id} className="flex items-center justify-between gap-2 rounded-lg bg-soft px-3 py-2 text-sm">
                      <span><span className="font-medium">{c.operator.name}</span><span className="block text-xs text-muted">{districtName(c.operator.primaryDistrict)} · {PLAN_GROUP_LABEL[c.group]}</span></span>
                      <button className="btn btn-secondary btn-sm" onClick={() => addMatch(c.operator)}>+ Add</button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">No listed operators match this district/vehicle/passenger combination — consider No Supply, or add an operator manually.</p>
              )}
              <div className="mt-3 flex gap-2">
                <select className="input dash" value={pickOp} onChange={(ev) => setPickOp(ev.target.value)} aria-label="Add any operator">
                  <option value="">Add any operator manually…</option>
                  {data.ops.filter((o) => !e.matches.some((m) => m.operatorId === o.id)).map((o) => (
                    <option key={o.id} value={o.id}>{o.name} — {districtName(o.primaryDistrict)}{isPubliclyListed(o, data.vehicles, data.cfg) ? "" : " (not publicly listed)"}</option>
                  ))}
                </select>
                <button className="btn btn-secondary btn-sm" disabled={!pickOp} onClick={() => { const o = opById(pickOp); if (o) addMatch(o); setPickOp(""); }}>Add</button>
              </div>
            </div>
          </section>

          {/* Options builder */}
          <section className="card p-5">
            <h2 className="mb-1 font-semibold text-navy">Options builder</h2>
            <p className="mb-3 text-xs text-muted">{optionList.length} option(s) selected. Copy and send to the customer on WhatsApp.</p>
            {optionList.length ? (
              <>
                <textarea readOnly className="input dash min-h-48 font-mono text-xs" value={optionsText} aria-label="Options message" />
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="btn btn-secondary btn-sm" onClick={() => navigator.clipboard?.writeText(optionsText).then(() => toast("Copied"))}><IconCopy size={15} /> Copy</button>
                  <a className="btn btn-whatsapp btn-sm" target="_blank" rel="noopener noreferrer" href={`https://wa.me/91${e.mobile}?text=${encodeURIComponent(optionsText)}`}><IconWhatsApp size={15} /> Send via WhatsApp</a>
                  {e.status === "options-ready" || stepIndex < PIPELINE.indexOf("options-ready") ? (
                    <button className="btn btn-blue btn-sm" onClick={() => setStatus(e.status === "options-ready" ? "options-sent" : "options-ready")}>
                      Mark {e.status === "options-ready" ? "Options Sent" : "Options Ready"}
                    </button>
                  ) : null}
                </div>
              </>
            ) : (
              <Empty>Tick &quot;In options&quot; on available operators to build the shortlist.</Empty>
            )}
          </section>

          {/* Customer response + connection */}
          <section className="card p-5">
            <h2 className="mb-3 font-semibold text-navy">Customer response &amp; operator connection</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <DField label="Customer response"><input className="input dash" defaultValue={e.customerResponse} key={e.customerResponse} placeholder="e.g. Reviewing with family" onBlur={(ev) => ev.target.value !== e.customerResponse && save({ ...e, customerResponse: ev.target.value }, `Customer response: ${ev.target.value}`)} /></DField>
              <DField label="Selected option">
                <select className="input dash" value={e.selectedOperatorId} onChange={(ev) => save({ ...e, selectedOperatorId: ev.target.value }, ev.target.value ? `Customer selected ${opById(ev.target.value)?.name}` : "Selection cleared")}>
                  <option value="">— none —</option>
                  {e.matches.map((m) => <option key={m.operatorId} value={m.operatorId}>{opById(m.operatorId)?.name}</option>)}
                </select>
              </DField>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="btn btn-secondary btn-sm" onClick={() => setStatus("customer-reviewing")}>Customer Reviewing</button>
              <button className="btn btn-blue btn-sm" disabled={!e.selectedOperatorId} onClick={() => setStatus("operator-connected")}>Record Operator Connected</button>
            </div>
          </section>
        </div>

        {/* Side panel */}
        <aside className="space-y-5">
          <section className="card space-y-3 p-5">
            <DField label="Assigned to">
              <select className="input dash" value={e.assignedTo} onChange={(ev) => save({ ...e, assignedTo: ev.target.value }, `Assigned to ${data.staff.find((s) => s.id === ev.target.value)?.name ?? "nobody"}`)}>
                <option value="">Unassigned</option>
                {data.staff.filter((s) => s.active).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </DField>
            {e.assignedTo !== me.id && <button className="btn btn-ghost btn-sm" onClick={() => save({ ...e, assignedTo: me.id }, `Assigned to ${me.name}`)}>Assign to me</button>}
            <DField label="Follow-up date">
              <input type="date" className="input dash" value={e.followUpDate} onChange={(ev) => save({ ...e, followUpDate: ev.target.value }, `Follow-up set: ${fmtDate(ev.target.value)}`)} />
            </DField>
          </section>
          <section className="card p-5">
            <h2 className="mb-3 font-semibold text-navy">Notes &amp; activity</h2>
            <form
              onSubmit={(ev) => {
                ev.preventDefault();
                if (!note.trim()) return;
                save(e, `📝 ${note.trim()}`, "Note added");
                setNote("");
              }}
              className="mb-4 flex gap-2"
            >
              <input className="input dash" value={note} onChange={(ev) => setNote(ev.target.value)} placeholder="Add a note…" aria-label="Add note" />
              <button className="btn btn-blue btn-sm">Add</button>
            </form>
            <ol className="relative space-y-3 border-l border-line pl-4">
              {[...e.activity].reverse().map((a, i) => (
                <li key={i} className="text-sm">
                  <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-blue" />
                  <p>{a.text}</p>
                  <p className="text-xs text-muted">{a.by} · {fmtDateTime(a.at)}</p>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>

      {editReq && (
        <Modal title="Edit requirement" onClose={() => setEditReq(false)} wide>
          <form
            className="grid gap-3 sm:grid-cols-3"
            onSubmit={(ev) => {
              ev.preventDefault();
              const fd = new FormData(ev.currentTarget);
              const g = (k: string) => String(fd.get(k) ?? "");
              save({ ...e, name: g("name"), mobile: g("mobile"), district: g("district"), destination: g("destination"), travelDate: g("travelDate"), returnDate: g("returnDate"), passengers: +g("passengers") || e.passengers, vehicleType: g("vehicleType") as Enquiry["vehicleType"], acPreference: g("acPreference") as Enquiry["acPreference"], additional: g("additional") }, "Requirement updated");
              setEditReq(false);
            }}
          >
            <DField label="Name"><input name="name" className="input dash" defaultValue={e.name} /></DField>
            <DField label="Mobile"><input name="mobile" className="input dash" defaultValue={e.mobile} /></DField>
            <DField label="District"><select name="district" className="input dash" defaultValue={e.district}>{DISTRICTS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></DField>
            <DField label="Destination"><input name="destination" className="input dash" defaultValue={e.destination} /></DField>
            <DField label="Travel date"><input name="travelDate" type="date" className="input dash" defaultValue={e.travelDate} /></DField>
            <DField label="Return date"><input name="returnDate" type="date" className="input dash" defaultValue={e.returnDate} /></DField>
            <DField label="Passengers"><input name="passengers" className="input dash" defaultValue={e.passengers} /></DField>
            <DField label="Vehicle"><select name="vehicleType" className="input dash" defaultValue={e.vehicleType}><option value="any">Any</option>{VEHICLE_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></DField>
            <DField label="AC"><select name="acPreference" className="input dash" defaultValue={e.acPreference}><option value="no-preference">No preference</option><option value="ac">AC</option><option value="non-ac">Non-AC</option></select></DField>
            <DField label="Additional" className="sm:col-span-3"><input name="additional" className="input dash" defaultValue={e.additional} /></DField>
            <div className="sm:col-span-3"><button className="btn btn-blue btn-sm">Save requirement</button></div>
          </form>
        </Modal>
      )}
    </>
  );
}
