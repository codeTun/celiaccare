import Link from "next/link";

import { cn } from "@/lib/utils";

import { ADMIN_NAV, isAdminNavItemActive } from "./admin-nav-items";

/**
 * The grouped links of the admin sidebar (on the dark green background).
 * Shared by the server (Suspense fallback, nothing highlighted) and the client
 * (ActiveAdminNav, which passes the current pathname to highlight the section).
 */
export function AdminNavList({ pathname, className }: { pathname: string | null; className?: string }) {
  return (
    <nav aria-label="Sections de l'administration" className={cn("flex flex-col gap-6", className)}>
      {ADMIN_NAV.map((group) => (
        <div key={group.label}>
          <p className="px-3 text-[0.68rem] font-bold tracking-[0.14em] text-brand-300/70 uppercase">{group.label}</p>
          <ul className="mt-2 space-y-0.5">
            {group.items.map((item) => {
              const active = isAdminNavItemActive(item.href, pathname);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                      active ? "bg-white/10 text-white" : "text-brand-100/75 hover:bg-white/5 hover:text-white",
                    )}
                  >
                    {active ? (
                      <span className="absolute inset-y-2 start-0 w-1 rounded-full bg-saffron-400" aria-hidden="true" />
                    ) : null}
                    <Icon
                      className={cn(
                        "size-[18px] shrink-0",
                        active ? "text-brand-300" : "text-brand-300/60 group-hover:text-brand-200",
                      )}
                      aria-hidden="true"
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
