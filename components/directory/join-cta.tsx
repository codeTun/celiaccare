import { ArrowRight, MapPinPlus } from "lucide-react";
import Link from "next/link";

import { LogoEmblem } from "@/components/logo";
import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { localePath } from "@/i18n/config";
import type { Locale } from "@/types";

/**
 * Green call-to-action band at the bottom of the directory pages:
 * "Become a partner" (contact form, PARTNERSHIP subject) and "Suggest an address" (EF-21).
 */
export function JoinCta({
  locale,
  texts,
}: {
  locale: Locale;
  /** dict.restaurants.join or dict.producers.join */
  texts: { title: string; text: string; cta: string; suggest: string };
}) {
  const contact = localePath(locale, "/contact");

  return (
    <section className="py-14 sm:py-20">
      <Container>
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-brand-900 bg-khatam-light px-6 py-10 text-white sm:px-12 sm:py-14">
          {/* the jasmine doorway of the logo, as a large watermark */}
          <LogoEmblem className="absolute -end-10 -bottom-14 -z-10 size-64 opacity-10 sm:size-80" />
          <div className="max-w-2xl">
            <h2 className="text-2xl font-extrabold sm:text-3xl">{texts.title}</h2>
            <p className="mt-3 text-base leading-relaxed text-brand-100">{texts.text}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href={`${contact}?sujet=PARTNERSHIP`} className={buttonStyles({ variant: "white", size: "lg" })}>
                {texts.cta}
                <ArrowRight className="rtl:rotate-180" aria-hidden="true" />
              </Link>
              <Link
                href={`${contact}?sujet=SUGGESTION`}
                className={buttonStyles({
                  variant: "ghost",
                  size: "lg",
                  className: "text-white ring-1 ring-white/30 hover:bg-white/10 hover:text-white",
                })}
              >
                <MapPinPlus aria-hidden="true" />
                {texts.suggest}
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
