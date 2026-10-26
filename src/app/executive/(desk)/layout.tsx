"use client";
import { IconChart, IconHome, IconInbox, IconPlus } from "@/components/Icons";
import { StaffShell } from "@/components/staff/StaffShell";

const nav = [
  { href: "/executive/", label: "Dashboard", icon: IconHome },
  { href: "/executive/inbox/", label: "Enquiry Inbox", icon: IconInbox },
  { href: "/executive/new/", label: "Create Enquiry", icon: IconPlus },
  { href: "/executive/reports/", label: "Reports", icon: IconChart },
];

// Admins have full access, so they can also work the executive desk.
export default function ExecutiveLayout({ children }: { children: React.ReactNode }) {
  return <StaffShell area="Executive Dashboard" allowed={["executive", "admin"]} nav={nav}>{children}</StaffShell>;
}
