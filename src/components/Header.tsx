"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { DISTRICTS, VEHICLE_CATEGORIES } from "@/lib/constants";
import { IconChevronDown, IconMenu, IconX } from "./Icons";
import { Logo } from "./Logo";

const vehicleLinks = VEHICLE_CATEGORIES.map((c) => ({
  href: `/vehicles/${c.id}/`,
  label: c.name,
  note: c.live ? c.seatRange : "Coming soon",
}));
const locationLinks = [
  ...DISTRICTS.filter((d) => d.approvedPage).map((d) => ({ href: `/locations/${d.id}/`, label: d.name, note: "" })),
  { href: "/locations/", label: "All locations →", note: "" },
];

function Dropdown({ label, items }: { label: string; items: { href: string; label: string; note: string }[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("click", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", esc);
    };
  }, []);
  return (
    <div ref={ref} className="relative" onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setOpen(true)}
        className="flex items-center gap-1 rounded-lg px-3 py-2 text-[15px] font-medium text-ink hover:text-blue"
      >
        {label} <IconChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 pt-2">
          <ul className="card animate-fade w-64 p-2">
            {items.map((i) => (
              <li key={i.href}>
                <Link
                  href={i.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-soft"
                >
                  <span className="font-medium text-navy">{i.label}</span>
                  {i.note && <span className="text-xs text-muted">{i.note}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const simple = [
  { href: "/let-tourzin-help/", label: "Let Tourzin Help" },
  { href: "/for-operators/", label: "For Operators" },
  { href: "/about/", label: "About" },
  { href: "/contact/", label: "Contact" },
];

export function Header() {
  const [menu, setMenu] = useState(false);
  const path = usePathname();
  useEffect(() => setMenu(false), [path]);
  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
  }, [menu]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-navy focus:px-3 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <div className="container-x flex h-16 items-center justify-between gap-4 lg:h-[72px]">
        <Logo />
        <nav aria-label="Main" className="hidden items-center lg:flex">
          <Dropdown label="Vehicles" items={vehicleLinks} />
          <Dropdown label="Locations" items={locationLinks} />
          {simple.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-2 text-[15px] font-medium hover:text-blue ${path?.startsWith(l.href) ? "text-blue" : "text-ink"}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/for-operators/#join" className="btn btn-secondary btn-sm hidden xl:inline-flex">
            List Your Vehicle
          </Link>
          <Link href="/let-tourzin-help/" className="btn btn-blue btn-sm whitespace-nowrap lg:hidden xl:inline-flex">
            Quick Booking
          </Link>
          {/* Phones get Quick Booking up top — the search form is already on the page */}
          <Link href="/search/" className="btn btn-primary btn-sm hidden sm:inline-flex">
            Search Vehicles
          </Link>
          <button
            type="button"
            className="-mr-2 grid h-11 w-11 place-items-center rounded-lg text-navy lg:hidden"
            aria-label={menu ? "Close menu" : "Open menu"}
            aria-expanded={menu}
            onClick={() => setMenu((m) => !m)}
          >
            {menu ? <IconX size={24} /> : <IconMenu size={24} />}
          </button>
        </div>
      </div>

      {menu && (
        <div className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-white lg:hidden">
          <nav aria-label="Mobile" className="container-x space-y-6 py-6">
            <Link href="/search/" className="btn btn-primary w-full sm:hidden">
              Search Vehicles
            </Link>
            <div>
              <p className="eyebrow mb-2">Vehicles</p>
              <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                {vehicleLinks.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="flex justify-between rounded-lg px-2 py-2.5 font-medium text-navy hover:bg-soft">
                      {l.label} <span className="text-sm font-normal text-muted">{l.note}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow mb-2">Locations</p>
              <ul className="grid grid-cols-2 gap-1">
                {locationLinks.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="block rounded-lg px-2 py-2.5 font-medium text-navy hover:bg-soft">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <ul className="space-y-1 border-t border-line pt-4">
              {simple.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="block rounded-lg px-2 py-2.5 text-lg font-semibold text-navy hover:bg-soft">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/for-operators/#join" className="btn btn-secondary w-full">
              List Your Vehicle
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
