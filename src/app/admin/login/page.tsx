"use client";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Logo } from "@/components/Logo";
import { db, DATA_SOURCE } from "@/lib/data";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const u = await db.signIn(email, password);
      const next = new URLSearchParams(window.location.search).get("next");
      const home = u.role === "executive" ? "/executive/" : "/admin/";
      router.replace(next && (u.role === "admin" || next.startsWith("/executive")) ? next : home);
    } catch (ex) {
      setErr((ex as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const fill = (em: string, pw: string) => { setEmail(em); setPassword(pw); };

  return (
    <main className="grid min-h-screen place-items-center bg-navy p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center"><Logo light /></div>
        <form onSubmit={submit} className="card space-y-4 p-6">
          <div>
            <h1 className="text-xl font-bold text-navy">Staff sign in</h1>
            <p className="text-sm text-muted">Admin and Executive access only.</p>
          </div>
          <label className="block">
            <span className="label">Email</span>
            <input className="input" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="block">
            <span className="label">Password</span>
            <input className="input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          {err && <p className="field-error" role="alert">{err}</p>}
          <button disabled={busy} className="btn btn-blue w-full">{busy ? "Signing in…" : "Sign in"}</button>
        </form>
        {DATA_SOURCE === "mock" && (
          <div className="mt-4 rounded-xl bg-white/10 p-4 text-sm text-white/80">
            <p className="mb-2 font-semibold text-white">Demo accounts</p>
            <button type="button" onClick={() => fill("admin@tourzin.com", "admin123")} className="block w-full rounded-lg px-2 py-1.5 text-left hover:bg-white/10">Admin — admin@tourzin.com / admin123</button>
            <button type="button" onClick={() => fill("exec@tourzin.com", "exec123")} className="block w-full rounded-lg px-2 py-1.5 text-left hover:bg-white/10">Executive — exec@tourzin.com / exec123</button>
          </div>
        )}
      </div>
    </main>
  );
}
