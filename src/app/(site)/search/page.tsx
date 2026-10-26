import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SearchForm } from "@/components/SearchForm";
import { SearchFormFromQuery } from "@/components/SearchFormFromQuery";
import { PageHero } from "@/components/ui";

export const metadata: Metadata = {
  title: "Search Tourist Vehicles",
  description: "Search tourist vehicle operators by district, vehicle type and passenger count across Tamil Nadu.",
  alternates: { canonical: "/search/" },
};

export default function SearchPage() {
  return (
    <>
      <PageHero
        eyebrow="Search"
        title="Search Tourist Vehicles"
        sub="Choose your district to see operators based there first, followed by operators who serve it."
      >
        <div className="mt-8 max-w-5xl">
          <Suspense fallback={<SearchForm source="search_page" />}>
            <SearchFormFromQuery />
          </Suspense>
        </div>
      </PageHero>
      <section className="container-x py-12">
        <div className="card flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="h3">Want us to find options for you?</h2>
            <p className="text-sm text-muted">Share your trip details and a Tourzin executive will help.</p>
          </div>
          <Link href="/let-tourzin-help/" className="btn btn-secondary">Let Tourzin Help</Link>
        </div>
      </section>
    </>
  );
}
