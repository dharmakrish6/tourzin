"use client";
import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { SAFETY_CHECKLIST } from "@/lib/constants";
import { useIsMobile } from "@/lib/hooks";
import { IconCheck, IconCopy, IconPhone, IconShield, IconWhatsApp, IconX } from "./Icons";

export interface ContactTarget {
  mode: "call" | "whatsapp";
  operatorId: string;
  operatorName: string;
  phone: string;
  whatsapp: string;
  message: string;
  district: string;
}

const pretty = (p: string) => {
  const d = p.replace(/\D/g, "").slice(-10);
  return `+91 ${d.slice(0, 5)} ${d.slice(5)}`;
};

/** Safety checklist shown EVERY time before Call or WhatsApp (spec §7.6). */
export function SafetyModal({ target, onClose }: { target: ContactTarget; onClose: () => void }) {
  const [accepted, setAccepted] = useState(false);
  const [stage, setStage] = useState<"checklist" | "call">("checklist");
  const [copied, setCopied] = useState(false);
  const mobile = useIsMobile();
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    track("safety_checklist_shown", { operator_id: target.operatorId, mode: target.mode });
    firstRef.current?.focus();
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && dialogRef.current) {
        const f = dialogRef.current.querySelectorAll<HTMLElement>("button, a[href], input, [tabindex]:not([tabindex='-1'])");
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prev?.focus();
    };
  }, [target, onClose]);

  const proceed = () => {
    track("safety_checklist_accepted", { operator_id: target.operatorId, mode: target.mode });
    if (target.mode === "whatsapp") {
      const num = target.whatsapp.replace(/\D/g, "");
      const url = `https://wa.me/${num.length === 10 ? "91" + num : num}?text=${encodeURIComponent(target.message)}`;
      track("whatsapp_opened", { operator_id: target.operatorId, district: target.district });
      window.open(url, "_blank", "noopener,noreferrer");
      onClose();
    } else {
      track("number_revealed", { operator_id: target.operatorId, district: target.district });
      setStage("call");
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(pretty(target.phone));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-navy/50 sm:items-center sm:p-4 animate-fade" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="safety-title"
        onClick={(e) => e.stopPropagation()}
        className="animate-sheet max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-lg sm:rounded-2xl"
      >
        <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-line bg-white px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-50 text-blue">
              <IconShield size={20} />
            </span>
            <div>
              <h2 id="safety-title" className="font-bold text-navy">
                {stage === "checklist" ? "Before you contact the operator" : `Call ${target.operatorName}`}
              </h2>
              <p className="text-sm text-muted">{target.operatorName}</p>
            </div>
          </div>
          <button onClick={onClose} className="-mr-2 grid h-10 w-10 place-items-center rounded-lg text-muted hover:bg-soft" aria-label="Close">
            <IconX />
          </button>
        </div>

        {stage === "checklist" ? (
          <div className="px-5 py-5">
            <p className="mb-3 text-sm text-ink">Please confirm these details directly with the operator before paying any advance:</p>
            <ul className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
              {SAFETY_CHECKLIST.map((c) => (
                <li key={c} className="flex gap-2">
                  <IconCheck size={16} className="mt-0.5 shrink-0 text-success" /> <span>{c}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 rounded-lg bg-soft p-3 text-xs leading-relaxed text-muted">
              Tourzin helps you discover and contact operators. Final quote, availability, booking confirmation and payment are
              agreed directly between you and the operator.
            </p>
            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-line p-3 hover:bg-soft">
              <input
                ref={firstRef}
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 accent-[#1769AA]"
              />
              <span className="text-sm font-medium">I&apos;ll confirm these details with the operator in writing</span>
            </label>
            <button
              onClick={proceed}
              disabled={!accepted}
              className={`btn mt-4 w-full ${target.mode === "whatsapp" ? "bg-whatsapp text-white hover:brightness-110" : "btn-blue"}`}
            >
              {target.mode === "whatsapp" ? (<><IconWhatsApp size={18} /> Continue to WhatsApp</>) : (<><IconPhone size={18} /> Show Number</>)}
            </button>
          </div>
        ) : (
          <div className="px-5 py-6 text-center">
            <p className="text-sm text-muted">Operator phone number</p>
            <p className="mt-1 text-3xl font-bold tracking-wide text-navy" aria-live="polite">
              {pretty(target.phone)}
            </p>
            <div className={`mt-5 grid gap-3 ${mobile ? "" : "sm:grid-cols-2"}`}>
              <a
                href={`tel:+91${target.phone.replace(/\D/g, "").slice(-10)}`}
                onClick={() => track("call_now_clicked", { operator_id: target.operatorId, district: target.district })}
                className="btn btn-blue w-full"
              >
                <IconPhone size={18} /> Call Now
              </a>
              {!mobile && (
                <button onClick={copy} className="btn btn-secondary w-full">
                  <IconCopy size={18} /> {copied ? "Copied!" : "Copy Number"}
                </button>
              )}
            </div>
            <p className="mt-4 text-xs text-muted">Mention you found them on Tourzin.</p>
          </div>
        )}
      </div>
    </div>
  );
}
