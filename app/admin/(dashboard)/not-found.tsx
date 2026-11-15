import { ArrowLeft, SearchX } from "lucide-react";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";

/**
 * notFound() inside an admin page (e.g. an unknown product id): shown INSIDE the
 * admin shell, so the sidebar stays available.
 */
export default function DashboardNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md rounded-[var(--radius-card)] border border-line bg-white p-6 text-center shadow-soft sm:p-8">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-brand-50 text-brand-700">
          <SearchX className="size-6" aria-hidden="true" />
        </div>
        <p className="mt-4 text-xs font-bold tracking-[0.14em] text-brand-700 uppercase">Erreur 404</p>
        <h1 className="mt-1 text-xl font-extrabold text-ink">Élément introuvable</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          Cet élément n&apos;existe pas ou a été supprimé. Il a peut-être été modifié par un autre administrateur.
        </p>
        <Link href="/admin" className={buttonStyles({ className: "mt-6" })}>
          <ArrowLeft aria-hidden="true" />
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
}
