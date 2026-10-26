"use client";
import { Suspense } from "react";
import { VehicleList } from "@/components/staff/VehicleList";
export default function Page() {
  return <Suspense><VehicleList /></Suspense>;
}
