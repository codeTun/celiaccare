import { ArrowRight, MapPinPlus } from "lucide-react";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { localePath } from "@/i18n/config";
import type { HomeDict } from "@/i18n/resources/fr/home";
import type { Locale } from "@/types";

import { CtaPanel, lightOutlineButton } from "../cta-panel";

/**
 * Dark green call to action: artisans and restaurant owners can become partners,
 * and everybody can suggest a gluten-free address. Both open the contact form
 * with the right subject already selected (?sujet=...).
 */
export function JoinBand({ lang, home }: { lang: Locale; home: HomeDict }) {
  const contactHref = localePath(lang, "/contact");

  return (
    <CtaPanel>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-brand-200 uppercase rtl:tracking-normal">
            <span className="h-px w-6 bg-brand-300" aria-hidden="true" />
            {home.join.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">{home.join.title}</h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-brand-100 sm:text-lg">{home.join.text}</p>
          <Link
            href={`${contactHref}?sujet=PARTNERSHIP`}
            className={buttonStyles({ variant: "white", size: "lg", className: "mt-8 w-full sm:w-auto" })}
          >
            {home.join.partnerCta}
            <ArrowRight className="rtl:rotate-180" aria-hidden="true" />
          </Link>
        </div>

        <div className="rounded-3xl bg-white/[0.07] p-6 ring-1 ring-white/15 backdrop-blur-sm sm:p-8">
          <span aria-hidden="true" className="grid size-12 place-items-center rounded-full bg-saffron-400 text-brand-950">
            <MapPinPlus className="size-6" />
          </span>
          <h3 className="mt-5 text-xl font-bold text-white">{home.join.suggestTitle}</h3>
          <p className="mt-2 leading-relaxed text-brand-100">{home.join.suggestText}</p>
          <Link href={`${contactHref}?sujet=SUGGESTION`} className={lightOutlineButton({ size: "md", className: "mt-6 w-full sm:w-auto" })}>
            {home.join.suggestCta}
          </Link>
        </div>
      </div>
    </CtaPanel>
  );
}
