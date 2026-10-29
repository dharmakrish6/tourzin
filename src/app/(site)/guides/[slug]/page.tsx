import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui";
import { GUIDES } from "@/lib/data/content";

export const dynamicParams = false;
export const generateStaticParams = () => GUIDES.map((g) => ({ slug: g.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const g = GUIDES.find((x) => x.slug === slug);
  if (!g) return {};
  return { title: g.title, description: g.excerpt, alternates: { canonical: `/guides/${g.slug}/` }, openGraph: { type: "article", title: g.title, description: g.excerpt } };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = GUIDES.find((x) => x.slug === slug);
  if (!g) notFound();
  const more = GUIDES.filter((x) => x.slug !== g.slug).slice(0, 3);
  return (
    <article className="container-x max-w-3xl py-10 sm:py-14">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { href: "/guides/", label: "Guides" }, { label: g.title }]} />
      <p className="eyebrow">{g.category}</p>
      <h1 className="h1 mt-2">{g.title}</h1>
      <p className="lead mt-4">{g.excerpt}</p>
      <p className="mt-3 text-sm text-muted">{g.readMins} min read</p>
      <div className="prose-tz mt-6">
        {g.body.map((s) => (
          <section key={s.h}>
            <h2>{s.h}</h2>
            {s.p.map((p, i) => <p key={i}>{p}</p>)}
          </section>
        ))}
      </div>
      <div className="mt-10 flex flex-col items-start gap-3 rounded-2xl bg-soft p-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-semibold text-navy">Ready to compare operators?</p>
        <Link href="/search/" className="btn btn-primary">Search Vehicles</Link>
      </div>
      <h2 className="h3 mt-12">More guides</h2>
      <ul className="mt-3 space-y-2">
        {more.map((m) => <li key={m.slug}><Link href={`/guides/${m.slug}/`} className="text-blue hover:underline">{m.title}</Link></li>)}
      </ul>
    </article>
  );
}
