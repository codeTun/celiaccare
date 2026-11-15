"use client";

import { RefreshCw, TriangleExclamationPoint } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { Button, buttonStyles } from "@/components/ui/button";

/**
 * Shown inside the admin frame when a page crashes (database unreachable, bug...).
 * In production the message of a server error is hidden; `digest` lets us find it in the logs.
 */
export default function AdminError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const digest = error instanceof Error && "digest" in error && typeof error.digest === "string" ? error.digest : null;

  return (
    <div className="mx-auto max-w-xl py-10">
      <div className="rounded-[var(--radius-card)] border border-line bg-white p-6 text-center shadow-soft sm:p-8">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-red-50 text-red-600 ring-1 ring-red-100">
          <TriangleExclamationPoint className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-xl font-extrabold text-ink">Une erreur est survenue</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          Cette page n&apos;a pas pu être affichée. Réessayez ; si le problème continue, transmettez la référence
          ci-dessous à la personne qui s&apos;occupe du site.
        </p>
        {digest ? <p className="mt-3 font-mono text-xs text-ink-subtle">Référence : {digest}</p> : null}
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={() => retry()}>
            <RefreshCw aria-hidden="true" />
            Réessayer
          </Button>
          <Link href="/admin" className={buttonStyles({ variant: "outline" })}>
            Tableau de bord
          </Link>
        </div>
      </div>
    </div>
  );
}
