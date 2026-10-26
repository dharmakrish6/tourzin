"use client";
import {
  IconBus, IconChart, IconFile, IconHome, IconInbox, IconMail, IconPin, IconSettings, IconStar, IconStore, IconUsers, IconClipboard,
} from "@/components/Icons";
import { StaffShell } from "@/components/staff/StaffShell";

const nav = [
  { href: "/admin/", label: "Dashboard", icon: IconHome },
  { href: "/admin/operators/", label: "Operators", icon: IconStore },
  { href: "/admin/vehicles/", label: "Vehicles", icon: IconBus },
  { href: "/admin/leads/", label: "Operator Leads", icon: IconClipboard },
  { href: "/admin/subscriptions/", label: "Subscriptions", icon: IconStar },
  { href: "/admin/payments/", label: "Payments", icon: IconChart },
  { href: "/admin/districts/", label: "Districts", icon: IconPin },
  { href: "/admin/homepage/", label: "Homepage & Settings", icon: IconSettings },
  { href: "/admin/enquiries/", label: "Enquiries", icon: IconInbox },
  { href: "/admin/messages/", label: "Contact Messages", icon: IconMail },
  { href: "/admin/content/", label: "Content / SEO", icon: IconFile },
  { href: "/admin/reports/", label: "Reports", icon: IconChart },
  { href: "/admin/users/", label: "Users & Roles", icon: IconUsers },
];

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return <StaffShell area="Admin Panel" allowed={["admin"]} nav={nav}>{children}</StaffShell>;
}
