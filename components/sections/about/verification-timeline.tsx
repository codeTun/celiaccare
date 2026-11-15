import {
  BadgeCheck,
  Binoculars,
  CalendarSync,
  FileCheck,
  PhoneCall,
  Quote,
  ScanText,
  SearchCheck,
  Store,
  type LucideIcon,
} from "lucide-react";

import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { interpolate } from "@/i18n/interpolate";
import type { AboutDict } from "@/i18n/resources/fr/about";

/**
 * The verification method as a 4-step timeline (spec §6.1):
 * spotting → verification (call / visit / label / certificate) → publication with source and date
 * → review every 12 months + visitors' reports. Vertical on phones, horizontal on large screens.
 */
export function VerificationTimeline({ about, id }: { about: AboutDict; id?: string }) {
  const { method } = about;
  const steps: { key: string; icon: LucideIcon; title: string; text: string }[] = [
    { key: "spotting", icon: Binoculars, title: method.steps.spotting.title, text: method.steps.spotting.text },
    {
      key: "verification",
      icon: SearchCheck,
      title: method.steps.verification.title,
      text: method.steps.verification.text,
    },
    { key: "publication", icon: FileCheck, title: method.steps.publication.title, text: method.steps.publication.text },
    { key: "review", icon: CalendarSync, title: method.steps.review.title, text: method.steps.review.text },
  ];
  const checks: { key: string; icon: LucideIcon; label: string }[] = [
    { key: "call", icon: PhoneCall, label: method.steps.verification.checks.call },
    { key: "visit", icon: Store, label: method.steps.verification.checks.visit },
    { key: "label", icon: ScanText, label: method.steps.verification.checks.label },
    { key: "certificate", icon: BadgeCheck, label: method.steps.verification.checks.certificate },
  ];

  return (
    <section id={id} className="relative isolate scroll-mt-24 overflow-hidden bg-canvas py-16 sm:py-24">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-khatam opacity-60 [mask-image:linear-gradient(to_bottom,#000,transparent_70%)]"
      />
      <Container>
        <SectionHeading align="center" eyebrow={method.eyebrow} title={method.title} description={method.description} />

        <div className="relative mx-auto mt-12 max-w-2xl sm:mt-14 lg:max-w-none">
          {/* a row of door studs linking the steps (large screens) */}
          <div aria-hidden="true" className="studs absolute inset-x-[12.5%] top-8 hidden h-1.5 lg:block" />
          <ol className="relative grid gap-8 lg:grid-cols-4 lg:gap-6">
            {steps.map(({ key, icon: Icon, title, text }, index) => (
              <li
                key={key}
                className="relative flex gap-5 before:absolute before:start-[1.625rem] before:top-[4.75rem] before:-bottom-6 before:w-px before:bg-brand-200 last:before:hidden lg:flex-col lg:items-center lg:gap-0 lg:text-center lg:before:hidden"
              >
                <span
                  aria-hidden="true"
                  className="arch grid h-16 w-13 shrink-0 place-items-center bg-brand-600 text-white shadow-soft ring-4 ring-canvas"
                >
                  <Icon className="size-6" />
                </span>
                <div className="min-w-0 pt-1 lg:mt-5 lg:pt-0">
                  <p className="text-xs font-bold tracking-[0.14em] text-brand-700 uppercase rtl:tracking-normal">
                    {interpolate(method.stepLabel, { number: index + 1 })}
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-ink">{title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{text}</p>
                  {key === "verification" ? (
                    <ul className="mt-3 flex flex-wrap gap-2 lg:justify-center">
                      {checks.map(({ key: checkKey, icon: CheckIcon, label }) => (
                        <li
                          key={checkKey}
                          className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-brand-800 ring-1 ring-brand-200"
                        >
                          <CheckIcon className="size-3.5" aria-hidden="true" />
                          {label}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* our golden rule, as a big quote */}
        <figure className="mx-auto mt-16 max-w-3xl text-center sm:mt-20">
          <Quote className="mx-auto size-10 text-brand-300 rtl:-scale-x-100" aria-hidden="true" />
          <blockquote className="mt-4 text-2xl leading-snug font-extrabold text-ink sm:text-3xl">
            <p>{method.quote}</p>
          </blockquote>
          <figcaption className="mt-4 text-sm font-semibold text-brand-700">{method.quoteAuthor}</figcaption>
        </figure>
      </Container>
    </section>
  );
}
