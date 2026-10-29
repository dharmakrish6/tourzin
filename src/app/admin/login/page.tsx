"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { db } from "@/lib/data";

export default function LoginPage() {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setErr(null);
    try {
      const u = await db.signIn();
      const next = new URLSearchParams(window.location.search).get("next");
      const home = u.role === "executive" ? "/executive/" : "/admin/";
      router.replace(next && (u.role === "admin" || next.startsWith("/executive")) ? next : home);
    } catch (ex) {
      setErr((ex as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-navy p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center"><Logo light /></div>
        <div className="card space-y-4 p-6">
          <div>
            <h1 className="text-xl font-bold text-navy">Staff sign in</h1>
            <p className="text-sm text-muted">Admin and Executive access only. Use the Google account an admin added in Users &amp; Roles.</p>
          </div>
          {err && <p className="field-error" role="alert">{err}</p>}
          <button type="button" onClick={submit} disabled={busy} className="btn btn-blue w-full">{busy ? "Signing in…" : "Sign in with Google"}</button>
        </div>
      </div>
    </main>
  );
}
