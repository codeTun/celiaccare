"use client";

import { usePathname } from "next/navigation";

import { AdminNavList } from "./admin-nav";

/**
 * Admin sidebar links with the current section highlighted.
 * usePathname() needs a <Suspense> parent (Cache Components):
 *
 * @example
 * <Suspense fallback={<AdminNavList pathname={null} />}>
 *   <ActiveAdminNav />
 * </Suspense>
 */
export function ActiveAdminNav({ className }: { className?: string }) {
  const pathname = usePathname();
  return <AdminNavList pathname={pathname} className={className} />;
}
