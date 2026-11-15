import { ArrowRight, PackageSearch, Search, ShoppingBasket, Truck, type LucideIcon } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { localePath } from "@/i18n/config";
import { interpolate } from "@/i18n/interpolate";
import type { HomeDict } from "@/i18n/resources/fr/home";
import { MAX_ORDERS_PER_DAY } from "@/lib/tunisia";
import type { Locale } from "@/types";

/** "Comment ça marche": choose → order (cash on delivery, 3 orders a day max) → delivered. */
export function HowItWorks({ lang, home }: { lang: Locale; home: HomeDict }) {
  const { steps } = home.howItWorks;
  const items: { key: string; icon: LucideIcon; title: string; text: string }[] = [
    { key: "choose", icon: Search, title: steps.choose.title, text: steps.choose.text },
    {
      key: "order",
      icon: ShoppingBasket,
      title: steps.order.title,
      text: interpolate(steps.order.text, { max: MAX_ORDERS_PER_DAY }),
    },
    { key: "delivered", icon: Truck, title: steps.delivered.title, text: steps.delivered.text },
  ];

  return (
    <section className="relative isolate overflow-hidden bg-canvas py-16 sm:py-24">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-khatam opacity-60 [mask-image:radial-gradient(ellipse_at_center,#000,transparent_75%)]"
      />
      <Container>
        <SectionHeading
          align="center"
          eyebrow={home.howItWorks.eyebrow}
          title={home.howItWorks.title}
          description={home.howItWorks.description}
        />

        <div className="relative mt-12 sm:mt-14">
          {/* a row of door studs linking the three steps (large screens) */}
          <div aria-hidden="true" className="studs absolute inset-x-[18%] top-8 hidden h-1.5 lg:block" />
          <ol className="relative grid gap-10 lg:grid-cols-3 lg:gap-8">
            {items.map(({ key, icon: Icon, title, text }, index) => (
              <li key={key} className="flex flex-col items-center text-center">
                <span className="relative grid size-16 place-items-center rounded-full bg-white text-brand-700 shadow-soft ring-1 ring-line">
                  <Icon className="size-7" strokeWidth={1.7} aria-hidden="true" />
                  <span
                    aria-hidden="true"
                    className="tabular absolute -end-1 -top-1 grid size-6 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white ring-2 ring-canvas"
                  >
                    {index + 1}
                  </span>
                </span>
                <h3 className="mt-5 text-lg font-bold text-ink">{title}</h3>
                <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-ink-muted">{text}</p>
              </li>
            ))}
          </ol>
        </div>

        <p className="mt-12 text-center">
          <Link
            href={localePath(lang, "/suivi")}
            className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 shadow-soft ring-1 ring-line transition-colors hover:text-brand-800 hover:ring-brand-200"
          >
            <PackageSearch className="size-4" aria-hidden="true" />
            {home.howItWorks.track}
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </p>
      </Container>
    </section>
  );
}
