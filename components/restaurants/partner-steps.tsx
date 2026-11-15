import { Bike, Handshake, ShoppingBasket } from "lucide-react";

import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { localePath } from "@/i18n/config";
import type { RestaurantsDict } from "@/i18n/resources/fr/restaurants";
import type { Locale } from "@/types";

const STEP_ICONS = [Handshake, ShoppingBasket, Bike];

/** "How to order from a partner restaurant" in 3 steps (restaurants directory). */
export function PartnerSteps({ locale, dict }: { locale: Locale; dict: RestaurantsDict }) {
  const { howTo } = dict;

  return (
    <section className="border-t border-line bg-canvas py-14 sm:py-20">
      <Container>
        <SectionHeading
          eyebrow={howTo.eyebrow}
          title={howTo.title}
          description={howTo.text}
          action={{ href: `${localePath(locale, "/restaurants")}?partenaires=1`, label: howTo.cta }}
        />
        <ol className="mt-10 grid gap-4 sm:grid-cols-3 sm:gap-6">
          {howTo.steps.map((step, index) => {
            const Icon = STEP_ICONS[index] ?? Handshake;
            return (
              <li
                key={step.title}
                className="relative overflow-hidden rounded-[var(--radius-card)] border border-line bg-white p-6 shadow-soft"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="grid size-11 place-items-center rounded-full bg-brand-50 text-brand-700">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="text-3xl font-extrabold text-brand-100 tabular" aria-hidden="true">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-bold text-ink">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{step.text}</p>
              </li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}
