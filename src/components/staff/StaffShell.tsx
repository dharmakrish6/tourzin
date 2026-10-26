"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, type ComponentType, type ReactNode } from "react";
import { db, DATA_SOURCE } from "@/lib/data";
import type { Role, StaffUser } from "@/lib/types";
import { IconLogout, IconMenu, IconX } from "../Icons";
import { Logo } from "../Logo";

const Ctx = createContext<StaffUser | null>(null);
export const useStaff = () => useContext(Ctx)!;

export interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  badge?: number;
}

/**
 * Private shell for Admin / Executive. Enforces role permissions client-side
 * (Firestore security rules enforce them server-side once on Firebase).
 */
export function StaffShell({
  area,
  allowed,
  nav,
  children,
}: {
  area: string;
  allowed: Role[];
  nav: NavItem[];
  children: ReactNode;
}) {
  const [user, setUser] = useState<StaffUser | null | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    db.currentUser().then((u) => {
      if (!u) router.replace(`/admin/login/?next=${encodeURIComponent(path ?? "/admin/")}`);
      setUser(u);
    });
  }, [router, path]);
  useEffect(() => setOpen(false), [path]);

  if (user === undefined)
    return <div className="grid min-h-screen place-items-center bg-soft text-muted">Loading…</div>;
  if (!user) return null;
  if (!allowed.includes(user.role))
    return (
      <div className="grid min-h-screen place-items-center bg-soft p-6">
        <div className="card max-w-md p-8 text-center">
          <h1 className="h2">Access restricted</h1>
          <p className="mt-2 text-muted">Your role ({user.role}) doesn&apos;t have access to the {area}.</p>
          <Link href={user.role === "executive" ? "/executive/" : "/admin/"} className="btn btn-blue mt-6">Go to your dashboard</Link>
        </div>
      </div>
    );

  const logout = async () => {
    await db.signOut();
    router.replace("/admin/login/");
  };

  const isActive = (href: string) => (href === "/admin/" || href === "/executive/" ? path === href : path?.startsWith(href));

  const sidebar = (
    <nav aria-label={`${area} navigation`} className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-5">
        <Logo href={user.role === "executive" ? "/executive/" : "/admin/"} light />
        <button className="text-white/70 lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><IconX /></button>
      </div>
      <p className="px-5 pb-2 text-[11px] font-semibold uppercase tracking-widest text-white/40">{area}</p>
      <ul className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {nav.map((n) => (
          <li key={n.href}>
            <Link
              href={n.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${isActive(n.href) ? "bg-white/12 text-white" : "text-white/70 hover:bg-white/6 hover:text-white"}`}
            >
              <n.icon size={18} /> <span className="flex-1">{n.label}</span>
              {!!n.badge && <span className="rounded-full bg-orange px-1.5 text-[11px] font-bold text-white">{n.badge}</span>}
            </Link>
          </li>
        ))}
      </ul>
      <div className="border-t border-white/10 p-4">
        {user.role === "admin" && (
          <div className="mb-3 flex gap-2 text-xs">
            <Link href="/admin/" className={`rounded-md px-2 py-1 ${path?.startsWith("/admin") ? "bg-white/15 text-white" : "text-white/60 hover:text-white"}`}>Admin</Link>
            <Link href="/executive/" className={`rounded-md px-2 py-1 ${path?.startsWith("/executive") ? "bg-white/15 text-white" : "text-white/60 hover:text-white"}`}>Executive</Link>
            <Link href="/" className="rounded-md px-2 py-1 text-white/60 hover:text-white">Site ↗</Link>
          </div>
        )}
        <p className="truncate text-sm font-semibold text-white">{user.name}</p>
        <p className="truncate text-xs text-white/50">{user.email} · {user.role}</p>
        <button onClick={logout} className="mt-3 flex items-center gap-2 text-sm text-white/70 hover:text-white"><IconLogout size={16} /> Sign out</button>
      </div>
    </nav>
  );

  return (
    <Ctx.Provider value={user}>
      <div className="min-h-screen bg-soft">
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 bg-navy lg:block">{sidebar}</aside>
        {open && (
          <div className="fixed inset-0 z-50 bg-navy/50 lg:hidden" onClick={() => setOpen(false)}>
            <aside className="h-full w-64 bg-navy animate-fade" onClick={(e) => e.stopPropagation()}>{sidebar}</aside>
          </div>
        )}
        <div className="lg:pl-60">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-white px-4 lg:hidden">
            <button onClick={() => setOpen(true)} aria-label="Open menu" className="text-navy"><IconMenu /></button>
            <span className="font-semibold text-navy">{area}</span>
          </header>
          {DATA_SOURCE === "mock" && (
            <div className="border-b border-orange/30 bg-orange-50 px-4 py-1.5 text-center text-xs text-ink lg:px-8">
              Demo mode — dummy data stored in this browser. <button className="font-semibold text-blue underline" onClick={async () => { if (confirm("Reset all demo data to the original seed?")) { await db.resetDemoData(); location.reload(); } }}>Reset demo data</button>
            </div>
          )}
          <main id="main" className="px-4 py-6 lg:px-8">{children}</main>
        </div>
      </div>
    </Ctx.Provider>
  );
}

export function PageTitle({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-navy">{title}</h1>
        {sub && <p className="mt-0.5 text-sm text-muted">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
