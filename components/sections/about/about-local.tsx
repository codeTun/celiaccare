import { ArrowRight, CookingPot, Croissant, Handshake, Route, TreePalm, Wheat, type LucideIcon } from "lucide-react";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { localePath } from "@/i18n/config";
import type { AboutDict } from "@/i18n/resources/fr/about";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types";

import { JasmineFlower } from "../decor";

/** Why CeliacCare only lists small local producers, with a "medina street" of three doorways. */
export function AboutLocal({ lang, about }: { lang: Locale; about: AboutDict }) {
  const { local } = about;
  const reasons: { key: string; icon: LucideIcon; title: string; text: string }[] = [
    { key: "knowhow", icon: Wheat, ...local.reasons.knowhow },
    { key: "relationship", icon: Handshake, ...local.reasons.relationship },
    { key: "shortCircuit", icon: Route, ...local.reasons.shortCircuit },
  ];

  return (
    <section className="bg-canvas py-16 sm:py-24">
      <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <SectionHeading eyebrow={local.eyebrow} title={local.title} description={local.text} />
          <ul className="mt-8 space-y-5">
            {reasons.map(({ key, icon: Icon, title, text }) => (
              <li key={key} className="flex gap-4">
                <span
                  aria-hidden="true"
                  className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-brand-700 shadow-soft ring-1 ring-line"
                >
                  <Icon className="size-5" />
                </span>
                <div>
                  <h3 className="font-bold text-ink">{title}</h3>
                  <p className="mt-1 text-[15px] leading-relaxed text-ink-muted">{text}</p>
                </div>
              </li>
            ))}
          </ul>
          <Link
            href={localePath(lang, "/artisans")}
            className={buttonStyles({ variant: "outline", size: "lg", className: "mt-9 w-full sm:w-auto" })}
          >
            {local.cta}
            <ArrowRight className="rtl:rotate-180" aria-hidden="true" />
          </Link>
        </div>

        {/* three doorways of a medina street: bread, the jasmine, couscous... and dates */}
        <div aria-hidden="true" className="relative mx-auto w-full max-w-md">
          <div className="grid grid-cols-3 items-end gap-3 sm:gap-4">
            <StreetDoor icon={Croissant} className="h-44 sm:h-52" />
            <div className="arch relative isolate grid h-60 place-items-center overflow-hidden bg-gradient-to-b from-brand-600 to-brand-800 shadow-lift ring-4 ring-white sm:h-72">
              <div className="absolute inset-0 -z-10 bg-khatam-light" />
              <JasmineFlower className="w-3/5" />
            </div>
            <StreetDoor icon={CookingPot} className="h-48 sm:h-56" />
          </div>
          {/* the street: a line of door studs */}
          <div className="studs mt-4 h-1.5 w-full" />
          <span className="absolute -end-3 -top-6 grid size-16 place-items-center rounded-full bg-white text-saffron-700 shadow-lift ring-1 ring-line">
            <TreePalm className="size-7" strokeWidth={1.6} />
          </span>
        </div>
      </Container>
    </section>
  );
}

function StreetDoor({ icon: Icon, className }: { icon: LucideIcon; className?: string }) {
  return (
    <div className={cn("arch relative isolate grid place-items-center overflow-hidden bg-white shadow-soft ring-1 ring-line", className)}>
      <div className="absolute inset-2 -z-10 arch bg-brand-50 bg-khatam" />
      <Icon className="size-1/3 text-brand-700" strokeWidth={1.5} />
    </div>
  );
}
