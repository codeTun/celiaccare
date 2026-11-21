import { HandCoins, HandHeart, MapPin, ShieldCheck, Users, type LucideIcon } from "lucide-react";

import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import type { AboutDict } from "@/i18n/resources/fr/about";

import { StudsDivider } from "../decor";

/**
 * The mission statement (big centered sentence), the 4 values, then our business model
 * (free delivery, fair prices, paid by a commission of the merchants). `modelId` = anchor of that block.
 */
export function AboutMission({ about, modelId }: { about: AboutDict; modelId: string }) {
  const { mission, model } = about;
  const values: { key: string; icon: LucideIcon; title: string; text: string }[] = [
    { key: "reliability", icon: ShieldCheck, ...mission.values.reliability },
    { key: "proximity", icon: MapPin, ...mission.values.proximity },
    { key: "accessibility", icon: HandHeart, ...mission.values.accessibility },
    { key: "community", icon: Users, ...mission.values.community },
  ];

  return (
    <div className="py-16 sm:py-24">
      <Container>
        <section className="mx-auto max-w-4xl text-center">
          <h2 className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-brand-700 uppercase rtl:tracking-normal">
            <span className="h-px w-6 bg-brand-400" aria-hidden="true" />
            {mission.eyebrow}
            <span className="h-px w-6 bg-brand-400" aria-hidden="true" />
          </h2>
          <p className="mt-5 text-2xl leading-snug font-extrabold text-ink sm:text-3xl lg:text-4xl lg:leading-tight">
            {mission.statement}
          </p>
          <StudsDivider className="mt-8" />
        </section>

        <section className="mt-16 sm:mt-20">
          <SectionHeading align="center" title={mission.valuesTitle} />
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {values.map(({ key, icon: Icon, title, text }) => (
              <li
                key={key}
                className="flex flex-col items-center rounded-[var(--radius-card)] border border-line bg-white p-6 text-center shadow-soft transition duration-200 hover:-translate-y-0.5 hover:shadow-lift"
              >
                <span aria-hidden="true" className="arch grid h-16 w-13 place-items-center bg-brand-600 text-white">
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-ink">{title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section
          id={modelId}
          aria-labelledby="about-model-title"
          className="mx-auto mt-12 max-w-3xl scroll-mt-24 rounded-[var(--radius-card)] border border-brand-100 bg-brand-50/60 p-6 sm:mt-16 sm:p-8"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
            <span
              aria-hidden="true"
              className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-brand-700 shadow-soft ring-1 ring-brand-100"
            >
              <HandCoins className="size-6" />
            </span>
            <div>
              <h2 id="about-model-title" className="text-xl font-extrabold text-ink sm:text-2xl">
                {model.title}
              </h2>
              <div className="mt-3 space-y-2 text-[15px] leading-relaxed text-ink-muted">
                {model.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        </section>
      </Container>
    </div>
  );
}
