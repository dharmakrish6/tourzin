"use client";
import Link from "next/link";
import type { ComponentProps } from "react";
import { track, type EventName } from "@/lib/analytics";

export function TrackedLink({
  event,
  props,
  ...rest
}: ComponentProps<typeof Link> & { event: EventName; props?: Record<string, string | number> }) {
  return <Link {...rest} onClick={() => track(event, props)} />;
}
