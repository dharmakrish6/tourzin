"use client";
import { Suspense } from "react";
import { OperatorEditor } from "@/components/staff/OperatorEditor";

export default function Page() {
  return (
    <Suspense>
      <OperatorEditor />
    </Suspense>
  );
}
