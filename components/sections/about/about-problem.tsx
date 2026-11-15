import { Coins, MapPinOff, Puzzle, Quote, type LucideIcon } from "lucide-react";

import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import type { AboutDict } from "@/i18n/resources/fr/about";

/** "Le constat": the question every celiac person asks, and the three problems CeliacCare answers. */
export function AboutProblem({ about }: { about: AboutDict }) {
  const { problem } = about;
  const items: { key: string; icon: LucideIcon; title: string; text: string }[] = [
    { key: "places", icon: MapPinOff, ...problem.items.places },
    { key: "scattered", icon: Puzzle, ...problem.items.scattered },
    { key: "prices", icon: Coins, ...problem.items.prices },
  ];

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <SectionHeading eyebrow={problem.eyebrow} title={problem.title} />
        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-12">
          {/* the big question, in a soft green card */}
          <figure className="relative isolate flex flex-col justify-center overflow-hidden rounded-[var(--radius-card)] bg-brand-50 p-8 ring-1 ring-brand-100 sm:p-10">
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-khatam opacity-70" />
            <Quote className="size-10 text-brand-300 rtl:-scale-x-100" aria-hidden="true" />
            <blockquote className="mt-4 text-2xl leading-snug font-extrabold text-brand-900 sm:text-3xl">
              <p>{problem.quote}</p>
            </blockquote>
            <figcaption className="mt-4 text-base leading-relaxed text-ink-muted">{problem.quoteText}</figcaption>
          </figure>

          <ul className="flex flex-col gap-4">
            {items.map(({ key, icon: Icon, title, text }) => (
              <li key={key} className="flex gap-4 rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-soft sm:p-6">
                <span
                  aria-hidden="true"
                  className="grid size-12 shrink-0 place-items-center rounded-full bg-saffron-50 text-saffron-700 ring-1 ring-saffron-100"
                >
                  <Icon className="size-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-ink sm:text-lg">{title}</h3>
                  <p className="mt-1 text-[15px] leading-relaxed text-ink-muted">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
