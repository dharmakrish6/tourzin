import Link from "next/link";
import type { ReactNode } from "react";
import { IconCheckCircle, IconChevron, IconShield } from "./Icons";

export function VerifiedBadge({ small = false }: { small?: boolean }) {
  return (
    <span
      className={`badge bg-success-50 text-success ${small ? "text-[11px]" : ""}`}
      title="Completed Tourzin's formal verification process"
    >
      <IconShield size={small ? 12 : 14} /> Tourzin Verified
    </span>
  );
}

export function Breadcrumbs({ items }: { items: { href?: string; label: string }[] }) {
  const ld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.label,
      ...(it.href ? { item: it.href } : {}),
    })),
  };
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1">
            {it.href ? (
              <Link href={it.href} className="hover:text-blue hover:underline">
                {it.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink">
                {it.label}
              </span>
            )}
            {i < items.length - 1 && <IconChevron size={14} />}
          </li>
        ))}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </nav>
  );
}

export function SectionHead({ eyebrow, title, sub, action }: { eyebrow?: string; title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="h2">{title}</h2>
        {sub && <p className="mt-2 text-muted">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageHero({ eyebrow, title, sub, children, crumbs }: { eyebrow?: string; title: string; sub?: ReactNode; children?: ReactNode; crumbs?: { href?: string; label: string }[] }) {
  return (
    <section className="border-b border-line bg-soft">
      <div className="container-x py-10 sm:py-14">
        {crumbs && <Breadcrumbs items={crumbs} />}
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h1 className="h1 max-w-3xl">{title}</h1>
        {sub && <div className="lead mt-4 max-w-2xl">{sub}</div>}
        {children}
      </div>
    </section>
  );
}

export function Success({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div role="status" className="card animate-fade flex flex-col items-center p-8 text-center sm:p-12">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-success-50 text-success">
        <IconCheckCircle size={30} />
      </span>
      <h2 className="h2 mt-4">{title}</h2>
      <div className="mt-2 max-w-md text-muted">{children}</div>
    </div>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "warn"; children: ReactNode }) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm ${
        tone === "warn" ? "border-orange/30 bg-orange-50 text-ink" : "border-blue/20 bg-blue-50 text-ink"
      }`}
    >
      {children}
    </div>
  );
}
