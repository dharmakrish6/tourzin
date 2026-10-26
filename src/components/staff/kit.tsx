"use client";
import { useEffect, useState, type ReactNode } from "react";
import { IconX } from "../Icons";

export function Stat({ label, value, hint, tone = "default" }: { label: string; value: ReactNode; hint?: ReactNode; tone?: "default" | "warn" | "good" | "bad" }) {
  const c = { default: "text-navy", warn: "text-orange-600", good: "text-success", bad: "text-red-700" }[tone];
  return (
    <div className="card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${c}`}>{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}

const PILL: Record<string, string> = {
  green: "bg-success-50 text-success",
  blue: "bg-blue-50 text-blue",
  orange: "bg-orange-50 text-orange-600",
  gray: "bg-soft text-muted ring-1 ring-line",
  red: "bg-red-50 text-red-700",
  navy: "bg-navy text-white",
};
export function Pill({ tone = "gray", children }: { tone?: keyof typeof PILL; children: ReactNode }) {
  return <span className={`badge whitespace-nowrap ${PILL[tone]}`}>{children}</span>;
}

export const toneFor = (s: string): keyof typeof PILL =>
  ({
    active: "green", available: "green", booked: "green", "operator-connected": "green",
    "expiring-soon": "orange", "pending-verification": "orange", "pending-review": "orange", tentative: "orange", "awaiting-response": "orange", trial: "orange", "pending-payment": "orange", "alternative-offered": "orange",
    new: "blue", "new-lead": "blue", contacted: "blue", onboarding: "blue", matching: "blue", "requirement-review": "blue", "checking-availability": "blue", "options-ready": "blue", "options-sent": "blue", "customer-reviewing": "blue",
    expired: "red", rejected: "red", cancelled: "red", "not-available": "red", "not-booked": "red", "no-supply": "red", invalid: "red", "customer-unresponsive": "red", "operator-unresponsive": "red",
  } as Record<string, keyof typeof PILL>)[s] ?? "gray";

export function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", k);
      document.body.style.overflow = "";
    };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-navy/50 p-3 sm:p-8 animate-fade" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => e.stopPropagation()} className={`card w-full ${wide ? "max-w-4xl" : "max-w-xl"}`}>
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="font-bold text-navy">{title}</h2>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-soft" aria-label="Close"><IconX size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-dashed border-line bg-white p-10 text-center text-sm text-muted">{children}</div>;
}

export function Loading() {
  return (
    <div className="space-y-3" aria-busy="true">
      <div className="skeleton h-10 w-1/3" />
      <div className="skeleton h-64" />
    </div>
  );
}

/** Small transient confirmation */
export function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 2400);
    return () => clearTimeout(t);
  }, [msg]);
  const node = msg ? (
    <div role="status" className="fixed bottom-5 left-1/2 z-[70] -translate-x-1/2 rounded-xl bg-navy px-4 py-2.5 text-sm font-medium text-white shadow-xl animate-fade">{msg}</div>
  ) : null;
  return { toast: setMsg, toastNode: node };
}

export function DField({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-semibold text-muted">{label}</span>
      {children}
    </label>
  );
}

export const fmtDate = (s?: string) =>
  s ? new Date(s.length === 10 ? s + "T00:00:00" : s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
export const fmtDateTime = (s?: string) =>
  s ? new Date(s).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "—";

export function SortTh<K extends string>({ k, label, sort, setSort }: { k: K; label: string; sort: { k: K; dir: 1 | -1 }; setSort: (s: { k: K; dir: 1 | -1 }) => void }) {
  const on = sort.k === k;
  return (
    <th aria-sort={on ? (sort.dir === 1 ? "ascending" : "descending") : "none"}>
      <button className="inline-flex items-center gap-1 uppercase" onClick={() => setSort({ k, dir: on ? (sort.dir === 1 ? -1 : 1) : -1 })}>
        {label} {on ? (sort.dir === 1 ? "▲" : "▼") : ""}
      </button>
    </th>
  );
}
