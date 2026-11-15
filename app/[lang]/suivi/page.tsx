import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { TrackingFormSkeleton } from "@/components/checkout/skeletons";
import { TrackingForm } from "@/components/checkout/tracking-form";
import { PageHero } from "@/components/page-hero";
import { Container } from "@/components/ui/container";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/types";

import { trackOrderAction } from "./actions";

/**
 * Order tracking page (/fr/suivi, /ar/suivi), without an account (spec EF-11).
 * The confirmation screen links here with the reference: /fr/suivi?ref=CC-7K2P9Q.
 */

export async function generateMetadata({ params }: PageProps<"/[lang]/suivi">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { checkout } = getDictionary(lang);
  return pageMetadata({
    locale: lang,
    path: "/suivi",
    title: checkout.tracking.meta.title,
    description: checkout.tracking.meta.description,
    noIndex: true,
  });
}

export default async function TrackingPage({ params, searchParams }: PageProps<"/[lang]/suivi">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { checkout } = getDictionary(lang);

  return (
    <>
      <PageHero
        lang={lang}
        breadcrumbs={[{ label: checkout.tracking.meta.title, href: "/suivi" }]}
        eyebrow={checkout.tracking.hero.eyebrow}
        title={checkout.tracking.hero.title}
        description={checkout.tracking.hero.description}
      />
      <Container className="py-10 sm:py-14">
        {/* The address (?ref=) is only known at request time: read it inside <Suspense>. */}
        <Suspense fallback={<TrackingFormSkeleton />}>
          <TrackingSection lang={lang} searchParams={searchParams} />
        </Suspense>
      </Container>
    </>
  );
}

async function TrackingSection({
  lang,
  searchParams,
}: {
  lang: Locale;
  searchParams: PageProps<"/[lang]/suivi">["searchParams"];
}) {
  const { ref } = await searchParams;
  // Only keep something that looks like a reference ("CC-7K2P9Q"): letters, digits and dashes.
  const reference = (typeof ref === "string" ? ref : "").replace(/[^A-Za-z0-9-]/g, "").slice(0, 20);
  const { checkout } = getDictionary(lang);

  return (
    <TrackingForm
      // A new ?ref= starts a fresh form (the page may be kept alive in the background).
      key={reference}
      lang={lang}
      texts={checkout}
      defaultReference={reference}
      // Bound ONCE here, on the server (binding inside the Client Component loops forever, see KNOWN-ISSUES).
      trackOrder={trackOrderAction.bind(null, lang)}
    />
  );
}
