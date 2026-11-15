import { Suspense } from "react";

import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { AdminSectionTitle } from "@/components/admin/admin-section-title";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { AdminUserMenu, AdminUserMenuSkeleton } from "@/components/admin/admin-user-menu";
import { requireAdmin } from "@/lib/auth/session";

import { logoutAction } from "../login/actions";

/**
 * The protected admin area (route group "(dashboard)": no URL segment, /admin/...).
 *
 * Layout = sidebar (desktop) + top bar (mobile menu, section title, "Voir le site",
 * admin + logout) + the page.
 *
 * Security: the session is verified here (SignedInAdmin → requireAdmin), but a layout
 * does NOT protect the pages under it (it is not re-run on every navigation). So EVERY
 * page and EVERY Server Action of the admin also starts with `await requireAdmin()`.
 *
 * Cache Components: the frame (sidebar, top bar) has no request data, so it is sent
 * immediately. Request-time parts are inside <Suspense>: the user menu here, the page
 * through loading.tsx.
 */
export default function DashboardLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-dvh">
      <a
        href="#main"
        className="sr-only rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lift focus:not-sr-only focus:fixed focus:start-4 focus:top-3 focus:z-50"
      >
        Aller au contenu
      </a>

      <AdminSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar
          menu={<AdminMobileNav />}
          title={
            <Suspense fallback="Administration">
              <AdminSectionTitle />
            </Suspense>
          }
          user={
            <Suspense fallback={<AdminUserMenuSkeleton />}>
              <SignedInAdmin />
            </Suspense>
          }
        />
        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-[96rem] flex-1 px-4 py-6 outline-none sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

/** Checks the session (redirects to /admin/login when it is not valid) and shows who is logged in. */
async function SignedInAdmin() {
  const admin = await requireAdmin();
  return <AdminUserMenu admin={admin} logoutAction={logoutAction} />;
}
