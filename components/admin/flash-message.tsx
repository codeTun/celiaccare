"use client";

import { X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useLayoutEffect, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

/** Messages for the usual ?ok=... codes (pages can add their own with `messages`). */
export const DEFAULT_FLASH_MESSAGES: Record<string, string> = {
  created: "L'élément a bien été créé.",
  updated: "Les modifications ont été enregistrées.",
  deleted: "L'élément a été supprimé.",
  saved: "C'est enregistré.",
  archived: "L'élément a été archivé.",
  sent: "C'est envoyé.",
};

type FlashMessageProps = {
  /** Extra or replacement messages: { published: "L'avis est maintenant visible sur le site." } */
  messages?: Record<string, string>;
  /** Name of the search param (default "ok"). */
  param?: string;
  className?: string;
};

/**
 * Green confirmation after a redirect, e.g. an action that ends with
 * `redirect("/admin/produits?ok=created")`. The param is then removed from the URL
 * (so a refresh does not show the message again); the message stays until closed.
 *
 * @example
 * <FlashMessage />
 * <FlashMessage messages={{ "2fa-on": "La double authentification est activée." }} />
 */
export function FlashMessage(props: FlashMessageProps) {
  // useSearchParams() needs a <Suspense> parent (Cache Components).
  return (
    <Suspense fallback={null}>
      <FlashMessageContent {...props} />
    </Suspense>
  );
}

function FlashMessageContent({ messages, param = "ok", className }: FlashMessageProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const code = searchParams.get(param);
  const all = { ...DEFAULT_FLASH_MESSAGES, ...messages };
  const text = code && Object.hasOwn(all, code) ? all[code] : null;

  // Remember the message: it must stay visible after the param leaves the URL.
  const [shown, setShown] = useState<string | null>(null);
  if (text && text !== shown) setShown(text);

  // Then clean the URL (replace: no new history entry, no scroll).
  useEffect(() => {
    if (!code) return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete(param);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [code, param, pathname, router, searchParams]);

  // Next.js keeps visited pages mounted but hidden: forget the message when leaving.
  useLayoutEffect(() => () => setShown(null), []);

  if (!shown) return null;
  return (
    <div className={cn("relative mb-6", className)}>
      <Alert tone="success" className="pe-12">
        {shown}
      </Alert>
      <button
        type="button"
        onClick={() => setShown(null)}
        className="absolute end-2 top-2 grid size-9 place-items-center rounded-full text-brand-800 transition-colors hover:bg-brand-100"
      >
        <X className="size-4" aria-hidden="true" />
        <span className="sr-only">Fermer le message</span>
      </button>
    </div>
  );
}
