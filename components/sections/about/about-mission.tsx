import { HandHeart, MapPin, ShieldCheck, Users, type LucideIcon } from "lucide-react";

import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import type { AboutDict } from "@/i18n/resources/fr/about";

import { StudsDivider } from "../decor";

/** The mission statement (big centered sentence), then the 4 values. */
export function AboutMission({ about }: { about: AboutDict }) {
  const { mission } = about;
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
      </Container>
    </div>
  );
}
