import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { LogoEmblem } from "@/components/logo";
import { buttonStyles } from "@/components/ui/button";

/** Admin page that does not exist (notFound() in an admin page, e.g. an unknown product id). */
export default function AdminNotFound() {
  return (
    <main id="main" className="flex min-h-dvh items-center justify-center bg-khatam px-4 py-12">
      <div className="w-full max-w-md rounded-[var(--radius-card)] border border-line bg-white p-6 text-center shadow-lift sm:p-8">
        <LogoEmblem className="mx-auto size-14" />
        <p className="mt-4 text-xs font-bold tracking-[0.14em] text-brand-700 uppercase">Erreur 404</p>
        <h1 className="mt-1 text-xl font-extrabold text-ink">Page introuvable</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          Cette page de l&apos;administration n&apos;existe pas, ou l&apos;élément demandé a été supprimé.
        </p>
        <Link href="/admin" className={buttonStyles({ className: "mt-6" })}>
          <ArrowLeft className="rtl:rotate-180" aria-hidden="true" />
          Retour au tableau de bord
        </Link>
      </div>
    </main>
  );
}
