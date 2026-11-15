import { HandCoins, HandHeart, Sprout, type LucideIcon } from "lucide-react";

import { ProducerCard } from "@/components/cards/producer-card";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { localePath } from "@/i18n/config";
import type { CommonDict } from "@/i18n/resources/fr/common";
import type { HomeDict } from "@/i18n/resources/fr/home";
import { pluralize } from "@/lib/utils";
import type { Locale, ProducerCardDTO } from "@/types";

/**
 * Small producers: why CeliacCare only works with small local businesses,
 * then the 4 artisans with the most products (from getProducers).
 */
export function ProducersSpotlight({
  lang,
  common,
  home,
  producers,
}: {
  lang: Locale;
  common: CommonDict;
  home: HomeDict;
  producers: ProducerCardDTO[];
}) {
  const { reasons } = home.producers;
  const items: { key: string; icon: LucideIcon; title: string; text: string }[] = [
    { key: "handmade", icon: HandHeart, ...reasons.handmade },
    { key: "fairPrice", icon: HandCoins, ...reasons.fairPrice },
    { key: "local", icon: Sprout, ...reasons.local },
  ];
  const topProducers = [...producers].sort((a, b) => b.productCount - a.productCount).slice(0, 4);

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow={home.producers.eyebrow}
          title={home.producers.title}
          description={home.producers.description}
          action={topProducers.length > 0 ? { href: localePath(lang, "/artisans"), label: home.producers.seeAll } : undefined}
        />

        <ul className="mt-8 grid gap-3 sm:mt-10 sm:gap-4 md:grid-cols-3">
          {items.map(({ key, icon: Icon, title, text }) => (
            <li key={key} className="flex gap-4 rounded-2xl bg-canvas p-5">
              <span
                aria-hidden="true"
                className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-brand-700 shadow-soft ring-1 ring-line"
              >
                <Icon className="size-5" />
              </span>
              <div>
                <h3 className="font-bold text-ink">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">{text}</p>
              </div>
            </li>
          ))}
        </ul>

        {topProducers.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:mt-10 sm:gap-6 lg:grid-cols-4">
            {topProducers.map((producer) => (
              <ProducerCard
                key={producer.id}
                producer={producer}
                locale={lang}
                common={common}
                // the finished text ("منتجان", "3 produits"): Arabic needs more than one/other
                productsLabel={pluralize(lang, producer.productCount, home.producers.productCount)}
              />
            ))}
          </div>
        ) : null}
      </Container>
    </section>
  );
}
