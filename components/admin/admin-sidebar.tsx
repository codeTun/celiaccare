import { Suspense } from "react";

import { siteConfig } from "@/lib/site-config";

import { ActiveAdminNav } from "./admin-active-nav";
import { AdminBrand } from "./admin-brand";
import { AdminNavList } from "./admin-nav";

/**
 * Desktop sidebar (from the `lg` breakpoint): dark green with the zellige pattern,
 * the logo and the grouped section links. On phones the same links live in AdminMobileNav.
 */
export function AdminSidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col bg-brand-950 bg-khatam-light text-white lg:flex">
      <div className="flex h-16 shrink-0 items-center border-b border-white/10 px-5">
        <AdminBrand />
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-6">
        <Suspense fallback={<AdminNavList pathname={null} />}>
          <ActiveAdminNav />
        </Suspense>
      </div>
      <p className="shrink-0 border-t border-white/10 px-5 py-4 text-xs leading-relaxed text-brand-200/70">
        Espace réservé à l&apos;équipe {siteConfig.name}. Pensez à vous déconnecter sur un ordinateur partagé.
      </p>
    </aside>
  );
}
