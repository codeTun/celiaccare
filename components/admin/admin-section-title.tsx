"use client";

import { usePathname } from "next/navigation";

import { findAdminNavItem } from "./admin-nav-items";

/**
 * Name (and icon) of the current admin section, shown in the top bar.
 * Uses usePathname(): render it inside <Suspense fallback="Administration">.
 */
export function AdminSectionTitle() {
  const item = findAdminNavItem(usePathname());
  if (!item) return <span>Administration</span>;
  const Icon = item.icon;
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <Icon className="size-[18px] shrink-0 text-brand-600" aria-hidden="true" />
      <span className="truncate">{item.label}</span>
    </span>
  );
}
