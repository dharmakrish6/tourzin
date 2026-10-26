"use client";
import { useState, type FormEvent } from "react";
import { db } from "@/lib/data";
import { Success } from "../ui";
import { aria, cleanPhone, Field, focusFirstError, isEmail, isMobile, type Errors } from "./fields";

type Form = { name: string; mobile: string; email: string; subject: string; message: string };

export function ContactForm() {
  const [f, setF] = useState<Form>({ name: "", mobile: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Errors<Form>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k: keyof Form, v: string) => {
    setF((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    const e: Errors<Form> = {};
    if (!f.name.trim()) e.name = "Please enter your name";
    if (!isMobile(f.mobile)) e.mobile = "Enter a valid 10-digit mobile number";
    if (f.email && !isEmail(f.email)) e.email = "Enter a valid email address";
    if (!f.subject) e.subject = "Please choose a subject";
    if (f.message.trim().length < 5) e.message = "Please enter a short message";
    setErrors(e);
    if (Object.values(e).some(Boolean)) return focusFirstError(e, "c-");
    setBusy(true);
    try {
      await db.createContactMessage({ ...f, mobile: f.mobile.replace(/\D/g, "").slice(-10) });
      setDone(true);
    } finally {
      setBusy(false);
    }
  };

  if (done) return <Success title="Message sent">Thanks for reaching out. We&apos;ll get back to you during business hours.</Success>;

  return (
    <form noValidate onSubmit={submit} className="card grid gap-4 p-5 sm:grid-cols-2 sm:p-7">
      <Field id="c-name" label="Name" required error={errors.name}>
        <input {...aria("c-name", errors.name)} className="input" autoComplete="name" value={f.name} onChange={(e) => set("name", e.target.value)} />
      </Field>
      <Field id="c-mobile" label="Mobile" required error={errors.mobile}>
        <input {...aria("c-mobile", errors.mobile)} type="tel" className="input" autoComplete="tel" value={f.mobile} onChange={(e) => set("mobile", cleanPhone(e.target.value))} />
      </Field>
      <Field id="c-email" label="Email" optional error={errors.email}>
        <input {...aria("c-email", errors.email)} type="email" className="input" autoComplete="email" value={f.email} onChange={(e) => set("email", e.target.value)} />
      </Field>
      <Field id="c-subject" label="Subject" required error={errors.subject}>
        <select {...aria("c-subject", errors.subject)} className="input" value={f.subject} onChange={(e) => set("subject", e.target.value)}>
          <option value="">Select</option>
          {["Help finding a vehicle", "Operator / listing enquiry", "Feedback", "Report an issue", "Other"].map((s) => <option key={s}>{s}</option>)}
        </select>
      </Field>
      <Field id="c-message" label="Message" required error={errors.message} className="sm:col-span-2">
        <textarea {...aria("c-message", errors.message)} className="input" value={f.message} onChange={(e) => set("message", e.target.value)} maxLength={2000} />
      </Field>
      <button disabled={busy} className="btn btn-primary sm:col-span-2 sm:justify-self-start sm:px-10">{busy ? "Sending…" : "Send Message"}</button>
    </form>
  );
}
