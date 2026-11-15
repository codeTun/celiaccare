import { ExternalLink } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { buttonStyles } from "@/components/ui/button";

/**
 * Top bar of the admin panel (sticky). Slots:
 *  - menu:  the mobile menu button (AdminMobileNav), hidden from `lg`;
 *  - title: the current section (AdminSectionTitle inside <Suspense>);
 *  - user:  the logged-in admin + logout (AdminUserMenu inside <Suspense>).
 * Also shows "Voir le site", which opens the public website in a new tab.
 */
export function AdminTopbar({ menu, title, user }: { menu?: ReactNode; title: ReactNode; user: ReactNode }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-line bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
      {menu}
      <div className="min-w-0 flex-1 text-sm font-semibold text-ink">{title}</div>
      <Link
        href="/fr"
        target="_blank"
        rel="noopener noreferrer"
        prefetch={false}
        className={buttonStyles({ variant: "outline", size: "sm", className: "max-sm:px-3" })}
      >
        <ExternalLink aria-hidden="true" />
        <span className="max-sm:sr-only">Voir le site</span>
        <span className="sr-only"> (nouvel onglet)</span>
      </Link>
      {user}
    </header>
  );
}
