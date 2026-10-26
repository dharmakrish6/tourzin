"use client";
import type { ReactNode } from "react";

export type Errors<T> = Partial<Record<keyof T, string>>;

export const isMobile = (v: string) => /^[6-9]\d{9}$/.test(v.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, ""));
export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
export const cleanPhone = (v: string) => v.replace(/[^\d+ ]/g, "").slice(0, 15);

export function Field({
  id,
  label,
  required,
  optional,
  error,
  hint,
  children,
  className = "",
}: {
  id: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className={`label ${required ? "req" : ""}`}>
        {label} {optional && <span className="font-normal text-muted">(optional)</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && (
        <p id={`${id}-err`} className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/** a11y props for an input given its error */
export const aria = (id: string, error?: string) => ({
  id,
  "aria-invalid": !!error,
  "aria-describedby": error ? `${id}-err` : undefined,
});

/** Focus the first invalid field after validation */
export function focusFirstError(errors: Record<string, string | undefined>, prefix = "") {
  const first = Object.keys(errors).find((k) => errors[k]);
  if (first) document.getElementById(prefix + first)?.focus();
}
