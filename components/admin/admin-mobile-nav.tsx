"use client";

import { Menu, X } from "lucide-react";
import { Suspense, useId, useLayoutEffect, useRef } from "react";

import { Button } from "@/components/ui/button";

import { ActiveAdminNav } from "./admin-active-nav";
import { AdminBrand } from "./admin-brand";
import { AdminNavList } from "./admin-nav";

/**
 * Menu button of the top bar (phones / tablets, below `lg`) that opens the admin
 * sections in a drawer on the start side. Native <dialog>: Escape closes it, focus
 * stays inside while it is open. It also closes when a link is chosen.
 */
export function AdminMobileNav() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  // Next.js keeps visited pages mounted but hidden: never leave the drawer open behind.
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    return () => dialog?.close();
  }, []);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="-ms-2 lg:hidden"
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
      >
        <Menu aria-hidden="true" />
        <span className="sr-only">Ouvrir le menu</span>
      </Button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClick={(event) => {
          // Click on the dark backdrop, or on a link: close the drawer.
          const target = event.target;
          if (target === dialogRef.current || (target instanceof Element && target.closest("a"))) {
            dialogRef.current?.close();
          }
        }}
        className="fixed inset-y-0 start-0 end-auto m-0 h-dvh max-h-none w-72 max-w-[85vw] border-0 bg-brand-950 bg-khatam-light p-0 text-white shadow-lift backdrop:bg-brand-950/50 backdrop:backdrop-blur-[2px] lg:hidden"
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-white/10 ps-5 pe-3">
            <h2 id={titleId} className="sr-only">
              Menu de l&apos;administration
            </h2>
            <AdminBrand />
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="grid size-11 place-items-center rounded-full text-brand-100 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="size-5" aria-hidden="true" />
              <span className="sr-only">Fermer le menu</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-6">
            <Suspense fallback={<AdminNavList pathname={null} />}>
              <ActiveAdminNav />
            </Suspense>
          </div>
        </div>
      </dialog>
    </>
  );
}
