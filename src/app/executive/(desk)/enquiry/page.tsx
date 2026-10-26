"use client";
import { Suspense } from "react";
import { EnquiryDetail } from "@/components/staff/EnquiryDetail";

export default function Page() {
  return (
    <Suspense>
      <EnquiryDetail />
    </Suspense>
  );
}
