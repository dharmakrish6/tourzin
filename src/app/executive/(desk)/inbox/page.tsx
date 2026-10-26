"use client";
import { Suspense } from "react";
import { EnquiryTable } from "@/components/staff/EnquiryTable";

export default function InboxPage() {
  return (
    <Suspense>
      <EnquiryTable title="Enquiry Inbox" sub="New and active enquiries" defaultScope="active" detailBase="/executive/enquiry/" />
    </Suspense>
  );
}
