"use client";

import { RefreshCw, TriangleExclamationPoint } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

/** Shown when the login page itself fails (e.g. the database is unreachable). */
export default function LoginError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const digest = error instanceof Error && "digest" in error && typeof error.digest === "string" ? error.digest : null;

  return (
    <main id="main" className="flex min-h-dvh items-center justify-center bg-khatam px-4 py-12">
      <div className="w-full max-w-md rounded-[var(--radius-card)] border border-line bg-white p-6 text-center shadow-lift sm:p-8">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-red-50 text-red-600 ring-1 ring-red-100">
          <TriangleExclamationPoint className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-xl font-extrabold text-ink">Connexion momentanément impossible</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          Le service ne répond pas. Patientez quelques instants puis réessayez.
        </p>
        {digest ? <p className="mt-3 font-mono text-xs text-ink-subtle">Référence : {digest}</p> : null}
        <Button className="mt-6" onClick={() => retry()}>
          <RefreshCw aria-hidden="true" />
          Réessayer
        </Button>
      </div>
    </main>
  );
}
