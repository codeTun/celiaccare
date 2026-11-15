import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { localePath } from "@/i18n/config";
import type { AboutDict } from "@/i18n/resources/fr/about";
import type { Locale } from "@/types";

import { CtaPanel, lightOutlineButton } from "../cta-panel";
import { JasmineFlower } from "../decor";

/** Closing call to action of the about page: discover the products, or suggest an address. */
export function AboutClosing({ lang, about }: { lang: Locale; about: AboutDict }) {
  const { closing } = about;

  return (
    <CtaPanel>
      <div className="mx-auto max-w-2xl text-center">
        <span aria-hidden="true" className="mx-auto grid size-16 place-items-center rounded-full bg-white/10 ring-1 ring-white/20">
          <JasmineFlower className="size-10" />
        </span>
        <h2 className="mt-6 text-3xl font-extrabold text-white sm:text-4xl">{closing.title}</h2>
        <p className="mt-4 text-base leading-relaxed text-brand-100 sm:text-lg">{closing.text}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href={localePath(lang, "/produits")} className={buttonStyles({ variant: "white", size: "lg" })}>
            {closing.products}
            <ArrowRight className="rtl:rotate-180" aria-hidden="true" />
          </Link>
          <Link href={`${localePath(lang, "/contact")}?sujet=SUGGESTION`} className={lightOutlineButton()}>
            {closing.suggest}
          </Link>
        </div>
      </div>
    </CtaPanel>
  );
}
