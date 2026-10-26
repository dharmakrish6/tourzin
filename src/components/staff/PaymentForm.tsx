"use client";
import { useState, type FormEvent } from "react";
import { track } from "@/lib/analytics";
import { db } from "@/lib/data";
import type { Operator, Payment } from "@/lib/types";
import { DField, Modal } from "./kit";

/** Manual payment record — also extends the subscription period (no gateway in MVP). */
export function PaymentForm({ operator, onClose, onSaved }: { operator: Operator; onClose: () => void; onSaved: () => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const prevExpiry = operator.subscriptionExpiry;
  const start = prevExpiry && prevExpiry >= today ? prevExpiry : today;
  const end = new Date(start);
  end.setFullYear(end.getFullYear() + 1);
  const [f, setF] = useState({ amount: "", date: today, mode: "upi" as Payment["mode"], reference: "", periodStart: start, periodEnd: end.toISOString().slice(0, 10), plan: operator.plan, updateSub: true });
  const [err, setErr] = useState("");
  const isRenewal = operator.subscriptionStatus !== "trial" && operator.subscriptionStatus !== "pending-payment";

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!+f.amount) return setErr("Enter the amount paid");
    if (f.periodEnd <= f.periodStart) return setErr("Period end must be after start");
    const p: Payment = {
      id: `pay-${Date.now().toString(36)}`, operatorId: operator.id, amount: +f.amount, date: f.date, mode: f.mode, reference: f.reference,
      periodStart: f.periodStart, periodEnd: f.periodEnd, plan: f.plan, renewal: isRenewal,
    };
    await db.savePayment(p);
    if (f.updateSub) {
      await db.saveOperator({ ...operator, plan: f.plan, subscriptionStatus: "active", subscriptionStart: f.periodStart, subscriptionExpiry: f.periodEnd });
    }
    track("subscription_payment", { operator_id: operator.id, amount: p.amount, plan: p.plan });
    if (isRenewal) track("subscription_renewed", { operator_id: operator.id, plan: p.plan });
    onSaved();
  };

  return (
    <Modal title={`Record payment — ${operator.name}`} onClose={onClose}>
      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
        <DField label="Amount paid (₹)"><input className="input dash" inputMode="numeric" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value.replace(/\D/g, "") })} autoFocus /></DField>
        <DField label="Payment date"><input type="date" className="input dash" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></DField>
        <DField label="Mode">
          <select className="input dash" value={f.mode} onChange={(e) => setF({ ...f, mode: e.target.value as Payment["mode"] })}>
            <option value="upi">UPI</option><option value="bank-transfer">Bank transfer</option><option value="cash">Cash</option><option value="cheque">Cheque</option><option value="other">Other</option>
          </select>
        </DField>
        <DField label="Reference / note"><input className="input dash" value={f.reference} onChange={(e) => setF({ ...f, reference: e.target.value })} /></DField>
        <DField label="Plan"><select className="input dash" value={f.plan} onChange={(e) => setF({ ...f, plan: e.target.value as Payment["plan"] })}><option value="base">Base</option><option value="premium">Premium</option></select></DField>
        <div />
        <DField label="Period start"><input type="date" className="input dash" value={f.periodStart} onChange={(e) => setF({ ...f, periodStart: e.target.value })} /></DField>
        <DField label="Period end"><input type="date" className="input dash" value={f.periodEnd} onChange={(e) => setF({ ...f, periodEnd: e.target.value })} /></DField>
        <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" className="h-4 w-4" checked={f.updateSub} onChange={(e) => setF({ ...f, updateSub: e.target.checked })} /> Set subscription Active for this period</label>
        {err && <p className="field-error sm:col-span-2">{err}</p>}
        <div className="sm:col-span-2"><button className="btn btn-primary btn-sm">Save payment</button> <span className="ml-2 text-xs text-muted">{isRenewal ? "Will be recorded as a renewal" : "First payment"}</span></div>
      </form>
    </Modal>
  );
}
