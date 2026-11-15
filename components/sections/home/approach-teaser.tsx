import { ArrowRight, BadgeCheck, CalendarCheck, CircleCheck, FileSearch, PhoneCall, RotateCw, ScanText, Store, type LucideIcon } from "lucide-react";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { localePath } from "@/i18n/config";
import type { HomeDict } from "@/i18n/resources/fr/home";
import type { Locale } from "@/types";

import { JasmineFlower } from "../decor";

/**
 * "Notre démarche" teaser: how every sheet is checked before it is published
 * (call, visit, label, certificate), with its source and date, re-checked every 12 months.
 * Links to the about page.
 */
export function ApproachTeaser({ lang, home }: { lang: Locale; home: HomeDict }) {
  const { approach } = home;
  const checks: { key: string; icon: LucideIcon; label: string }[] = [
    { key: "call", icon: PhoneCall, label: approach.checks.call },
    { key: "visit", icon: Store, label: approach.checks.visit },
    { key: "label", icon: ScanText, label: approach.checks.label },
    { key: "certificate", icon: BadgeCheck, label: approach.checks.certificate },
  ];
  const points: { key: string; icon: LucideIcon; label: string }[] = [
    { key: "source", icon: FileSearch, label: approach.points.source },
    { key: "date", icon: CalendarCheck, label: approach.points.date },
    { key: "review", icon: RotateCw, label: approach.points.review },
  ];

  return (
    <section className="relative isolate overflow-hidden bg-canvas py-16 sm:py-24">
      <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="mb-2 inline-flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-brand-700 uppercase rtl:tracking-normal">
            <span className="h-px w-6 bg-brand-400" aria-hidden="true" />
            {approach.eyebrow}
          </p>
          <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">{approach.title}</h2>
          <p className="mt-4 text-base leading-relaxed text-ink-muted sm:text-lg">{approach.text}</p>
          <ul className="mt-7 space-y-3.5">
            {points.map(({ key, icon: Icon, label }) => (
              <li key={key} className="flex items-center gap-3 text-[15px] font-semibold text-ink">
                <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-600 text-white">
                  <Icon className="size-4" />
                </span>
                {label}
              </li>
            ))}
          </ul>
          <Link
            href={localePath(lang, "/a-propos")}
            className={buttonStyles({ variant: "outline", size: "lg", className: "mt-9 w-full sm:w-auto" })}
          >
            {approach.cta}
            <ArrowRight className="rtl:rotate-180" aria-hidden="true" />
          </Link>
        </div>

        {/* the "checklist" card, framed like a Tunisian doorway */}
        <div className="relative mx-auto w-full max-w-md">
          <div aria-hidden="true" className="arch absolute inset-x-[10%] -top-5 bottom-10 -z-10 bg-brand-100/70" />
          <div className="arch relative overflow-hidden bg-white px-6 pt-14 pb-6 shadow-lift ring-1 ring-line sm:px-8 sm:pt-16 sm:pb-8">
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-44 bg-khatam [mask-image:linear-gradient(to_bottom,#000,transparent)]"
            />
            <span aria-hidden="true" className="relative mx-auto grid size-14 place-items-center rounded-full bg-brand-600 shadow-soft ring-4 ring-white">
              <JasmineFlower className="size-9" />
            </span>
            <p className="relative mt-4 text-center text-xs font-bold tracking-[0.14em] text-brand-700 uppercase rtl:tracking-normal">
              {approach.cardTitle}
            </p>
            <ul className="relative mt-5 space-y-2.5">
              {checks.map(({ key, icon: Icon, label }) => (
                <li
                  key={key}
                  className="flex items-center gap-3 rounded-xl border border-line bg-white px-3.5 py-3 text-sm font-semibold text-ink"
                >
                  <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700">
                    <Icon className="size-4" />
                  </span>
                  {label}
                  <CircleCheck className="ms-auto size-5 shrink-0 text-brand-600" aria-hidden="true" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
