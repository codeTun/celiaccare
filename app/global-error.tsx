"use client";

import "./globals.css";

import { RotateCcw } from "lucide-react";
import { useEffect } from "react";

import { Logo } from "@/components/logo";
import { buttonStyles } from "@/components/ui/button";
import { htmlLang, localeNames, localePath, locales } from "@/i18n/config";
import { interpolate } from "@/i18n/interpolate";
import { common as ar } from "@/i18n/resources/ar/common";
import { common as fr } from "@/i18n/resources/fr/common";
import { fontVariables } from "@/lib/fonts";
import { siteConfig } from "@/lib/site-config";

/**
 * Last-resort error screen, used when the site layout itself crashes.
 * It replaces the whole page, so it renders its own <html> and <body>.
 * The language is unknown here: the message is shown in French and in Arabic.
 * (Errors inside a page use app/[lang]/error.tsx, which keeps the navbar.)
 */
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  // In production the message is generic; the digest lets us find the full error in the server logs.
  const digest = error instanceof Error && "digest" in error && typeof error.digest === "string" ? error.digest : null;

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="fr-TN" dir="ltr" className={fontVariables}>
      <body className="flex min-h-dvh flex-col">
        <title>{`${fr.states.errorTitle} · ${siteConfig.name}`}</title>

        <header className="border-b border-line">
          <div className="mx-auto flex h-16 w-full max-w-4xl items-center px-4 sm:px-6">
            <Logo />
          </div>
        </header>

        <main className="relative isolate flex flex-1 flex-col items-center px-4 py-14 text-center sm:px-6 sm:py-20">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-khatam [mask-image:radial-gradient(ellipse_at_top,#000_25%,transparent_70%)]"
          />

          <section lang="fr-TN" className="max-w-xl">
            <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">{fr.states.errorTitle}</h1>
            <p className="mt-3 text-base leading-relaxed text-ink-muted">{fr.states.errorText}</p>
          </section>

          <section
            lang="ar-TN"
            dir="rtl"
            className="mt-8 max-w-xl border-t border-line pt-8 [font-family:var(--font-arabic),var(--font-latin),system-ui,sans-serif]"
          >
            <h2 className="text-3xl font-extrabold tracking-normal text-ink sm:text-4xl">{ar.states.errorTitle}</h2>
            <p className="mt-3 text-base leading-relaxed text-ink-muted">{ar.states.errorText}</p>
          </section>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => retry()} className={buttonStyles({ size: "lg" })}>
              <RotateCcw aria-hidden="true" />
              <span>
                {fr.actions.retry} · <span lang="ar-TN">{ar.actions.retry}</span>
              </span>
            </button>
            {/* plain <a> links (not <Link>): they reload the whole site, which is what we want after a crash */}
            {locales.map((locale) => (
              <a
                key={locale}
                href={localePath(locale)}
                hrefLang={htmlLang[locale]}
                lang={htmlLang[locale]}
                className={buttonStyles({ variant: "outline", size: "lg" })}
              >
                {localeNames[locale]}
              </a>
            ))}
          </div>

          {digest ? (
            <p className="mt-8 text-xs text-ink-subtle">{interpolate(fr.states.errorReference, { digest })}</p>
          ) : null}
        </main>
      </body>
    </html>
  );
}
