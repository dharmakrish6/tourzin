"use client";
import { Suspense } from "react";
import { EnquiryTable } from "@/components/staff/EnquiryTable";
export default function Page() {
  return <Suspense><EnquiryTable title="All Enquiries" sub="View and search every enquiry" defaultScope="all" detailBase="/executive/enquiry/" /></Suspense>;
}
