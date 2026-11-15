import { ArrowRight, HeartHandshake, Microscope, Stethoscope, type LucideIcon } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { localePath } from "@/i18n/config";
import type { AboutDict } from "@/i18n/resources/fr/about";
import type { Locale } from "@/types";

/**
 * "Partenariats en cours": the kinds of partners we are working towards.
 * No partner is ever named before an agreement is signed (dashed cards = "in progress").
 */
export function AboutPartners({ lang, about }: { lang: Locale; about: AboutDict }) {
  const { partners } = about;
  const items: { key: string; icon: LucideIcon; title: string; text: string }[] = [
    { key: "associations", icon: HeartHandshake, ...partners.items.associations },
    { key: "health", icon: Stethoscope, ...partners.items.health },
    { key: "laboratories", icon: Microscope, ...partners.items.laboratories },
  ];

  return (
    <section className="bg-canvas py-16 sm:py-24">
      <Container>
        <SectionHeading eyebrow={partners.eyebrow} title={partners.title} description={partners.description} />
        <ul className="mt-10 grid gap-4 sm:gap-6 md:grid-cols-3">
          {items.map(({ key, icon: Icon, title, text }) => (
            <li key={key} className="flex flex-col rounded-[var(--radius-card)] border border-dashed border-line-strong bg-white/80 p-6">
              <div className="flex items-start justify-between gap-3">
                <span aria-hidden="true" className="grid size-12 place-items-center rounded-full bg-brand-50 text-brand-700">
                  <Icon className="size-6" strokeWidth={1.7} />
                </span>
                <Badge tone="saffron">{partners.status}</Badge>
              </div>
              <h3 className="mt-5 text-base font-bold text-ink sm:text-lg">{title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{text}</p>
            </li>
          ))}
        </ul>
        <Link
          href={`${localePath(lang, "/contact")}?sujet=PARTNERSHIP`}
          className={buttonStyles({ variant: "outline", className: "mt-8 w-full sm:w-auto" })}
        >
          {partners.cta}
          <ArrowRight className="rtl:rotate-180" aria-hidden="true" />
        </Link>
      </Container>
    </section>
  );
}
