import { PageHero } from "./ui";

export function LegalPage({ title, updated, sections }: { title: string; updated: string; sections: [string, string[]][] }) {
  return (
    <>
      <PageHero crumbs={[{ href: "/", label: "Home" }, { label: title }]} title={title} sub={<span className="text-sm">Last updated: {updated}</span>} />
      <div className="container-x max-w-3xl py-12">
        <p className="mb-8 rounded-xl border border-orange/30 bg-orange-50 p-4 text-sm">
          Draft placeholder text for the MVP build — to be reviewed and replaced by legal counsel before launch.
        </p>
        <div className="prose-tz">
          {sections.map(([h, ps]) => (
            <section key={h}>
              <h2>{h}</h2>
              {ps.map((p, i) => <p key={i}>{p}</p>)}
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
