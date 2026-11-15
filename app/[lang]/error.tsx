"use client";

import { RotateCcw, TriangleExclamationPoint } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";

import { LogoEmblem } from "@/components/logo";
import { Button, buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { defaultLocale, isLocale, localePath } from "@/i18n/config";
import { interpolate } from "@/i18n/interpolate";
import { common as commonAr } from "@/i18n/resources/ar/common";
import { common as commonFr } from "@/i18n/resources/fr/common";

/**
 * Shown instead of a page when it crashes (e.g. the database is unreachable).
 * The navbar and footer stay visible. Error screens cannot receive props from
 * the server, so the texts are read directly from the dictionary files.
 */
export default function PublicError({ error, retry }: { error: unknown; retry: () => void }) {
  const params = useParams<{ lang: string }>();
  const lang = isLocale(params.lang) ? params.lang : defaultLocale;
  const common = lang === "ar" ? commonAr : commonFr;

  // In production the message is generic; the digest lets us find the full error in the server logs.
  const digest = error instanceof Error && "digest" in error && typeof error.digest === "string" ? error.digest : null;

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-khatam [mask-image:radial-gradient(ellipse_at_top,#000_25%,transparent_70%)]"
      />
      <Container className="flex flex-col items-center py-16 text-center sm:py-24">
        <div aria-hidden="true" className="relative grid size-32 place-items-center rounded-full bg-brand-50 ring-1 ring-brand-100 sm:size-36">
          <LogoEmblem className="size-20 sm:size-24" />
          <span className="absolute -end-1 top-2 grid size-10 place-items-center rounded-full bg-saffron-400 text-brand-950 shadow-soft ring-4 ring-white">
            <TriangleExclamationPoint className="size-[18px]" />
          </span>
        </div>

        <h1 className="mt-10 text-4xl font-extrabold text-ink sm:text-5xl">{common.states.errorTitle}</h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-ink-muted sm:text-lg">{common.states.errorText}</p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button size="lg" onClick={() => retry()}>
            <RotateCcw aria-hidden="true" />
            {common.actions.retry}
          </Button>
          <Link href={localePath(lang)} className={buttonStyles({ variant: "outline", size: "lg" })}>
            {common.states.backHome}
          </Link>
        </div>

        {digest ? (
          <p className="mt-8 text-xs text-ink-subtle">
            {interpolate(common.states.errorReference, { digest })}
          </p>
        ) : null}
      </Container>
    </section>
  );
}
