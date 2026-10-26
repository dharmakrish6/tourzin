"use client";
import { useSearchParams } from "next/navigation";
import { categoryById, districtById } from "@/lib/constants";
import type { VehicleTypeId } from "@/lib/types";
import { SearchForm } from "./SearchForm";

/** Search page form preselected from ?district= / ?type= (category & district CTAs). */
export function SearchFormFromQuery() {
  const sp = useSearchParams();
  const d = sp.get("district") ?? "";
  const t = sp.get("type") ?? "";
  const p = (sp.get("passengers") ?? "").replace(/\D/g, "");
  return (
    <SearchForm
      key={`${d}|${t}|${p}`}
      source="search_page"
      initial={{
        district: districtById(d) ? d : "",
        type: categoryById(t)?.live ? (t as VehicleTypeId) : "",
        passengers: p,
      }}
    />
  );
}
