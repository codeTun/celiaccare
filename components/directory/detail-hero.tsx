import type { ReactNode } from "react";

import { Breadcrumbs, type BreadcrumbItem } from "@/components/breadcrumbs";
import { Container } from "@/components/ui/container";
import type { Locale } from "@/types";

/**
 * Header band of a restaurant or artisan page: same soft background as <PageHero>
 * (zellige pattern + a row of door studs at the bottom), breadcrumbs on top,
 * and the page's own layout (photo, <h1>, badges...) as children.
 */
export function DetailHero({
  lang,
  breadcrumbs,
  children,
}: {
  lang: Locale;
  /** Trail after the home page; the last item is the current page */
  breadcrumbs: BreadcrumbItem[];
  children: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden border-b border-line bg-canvas">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-khatam [mask-image:linear-gradient(to_bottom,#000_15%,transparent_90%)]"
      />
      <div aria-hidden="true" className="absolute -end-24 -top-40 -z-10 size-[30rem] rounded-full bg-brand-100/50 blur-3xl" />
      <Container className="py-8 sm:py-10 lg:py-12">
        <Breadcrumbs lang={lang} items={breadcrumbs} className="mb-7" />
        {children}
      </Container>
      <div aria-hidden="true" className="studs absolute inset-x-0 bottom-0 h-1.5 opacity-60" />
    </section>
  );
}
