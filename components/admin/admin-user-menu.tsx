import { LogOut, ShieldExclamationPoint } from "lucide-react";
import Link from "next/link";

import { Skeleton } from "@/components/ui/skeleton";
import { SubmitButton } from "@/components/ui/submit-button";
import type { AdminDTO } from "@/types";

/** "Iheb Ben Salah" → "IB" (first letters of the first two words). */
export function adminInitials(name: string): string {
  const letters = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
  return letters || "A";
}

/**
 * Logged-in admin in the top bar: initials avatar, name, e-mail, a reminder when 2FA
 * is off, and the logout button. `logoutAction` is the Server Action of app/admin/login/actions.ts.
 *
 * @example
 * <AdminUserMenu admin={admin} logoutAction={logoutAction} />
 */
export function AdminUserMenu({
  admin,
  logoutAction,
}: {
  admin: Pick<AdminDTO, "name" | "email" | "totpEnabled">;
  logoutAction: () => Promise<void>;
}) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {!admin.totpEnabled ? (
        <Link
          href="/admin/securite"
          className="hidden items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200 transition-colors hover:bg-amber-100 xl:inline-flex"
        >
          <ShieldExclamationPoint className="size-3.5" aria-hidden="true" />
          Activez la double authentification
        </Link>
      ) : null}

      <div className="hidden min-w-0 text-end leading-tight md:block">
        <p className="truncate text-sm font-semibold text-ink">{admin.name}</p>
        <p className="truncate text-xs text-ink-subtle">{admin.email}</p>
      </div>
      <span
        className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white ring-2 ring-brand-100"
        title={admin.name}
        aria-hidden="true"
      >
        {adminInitials(admin.name)}
      </span>
      <span className="sr-only md:hidden">Connecté en tant que {admin.name}</span>

      <form action={logoutAction}>
        <SubmitButton
          variant="ghost"
          size="icon-sm"
          title="Se déconnecter"
          pendingLabel={<span className="sr-only">Déconnexion…</span>}
        >
          <LogOut aria-hidden="true" />
          <span className="sr-only">Se déconnecter</span>
        </SubmitButton>
      </form>
    </div>
  );
}

/** Placeholder of AdminUserMenu while the session is checked. */
export function AdminUserMenuSkeleton() {
  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      <div className="hidden space-y-1.5 md:block">
        <Skeleton className="ms-auto h-3.5 w-24" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="size-9 rounded-full" />
      <Skeleton className="size-9 rounded-full" />
    </div>
  );
}
