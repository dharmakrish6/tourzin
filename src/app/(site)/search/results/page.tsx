import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchResultsView } from "@/components/search/SearchResultsView";

// Parameterised results are never indexed (spec §3, §15).
export const metadata: Metadata = {
  title: "Search Results",
  robots: { index: false, follow: true },
};

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="container-x py-16 text-muted">Loading…</div>}>
      <SearchResultsView />
    </Suspense>
  );
}
