import { MapPin } from "lucide-react";
import Link from "next/link";

import { placeLabel } from "@/components/directory/place";
import { Badge } from "@/components/ui/badge";
import { CloudImage } from "@/components/ui/cloud-image";
import { localePath } from "@/i18n/config";
import type { CommonDict } from "@/i18n/resources/fr/common";
import type { ProductsDict } from "@/i18n/resources/fr/products";
import type { Locale, ProducerSummaryDTO } from "@/types";

import { catalogHref } from "./catalog-params";

/**
 * The small business that makes the product: name, type, town, and links to its page and
 * to all its products. Never its phone or WhatsApp: every purchase goes through CeliacCare.
 * Server Component.
 */
export function ProducerBox({
  locale,
  producer,
  labels,
  common,
}: {
  locale: Locale;
  producer: ProducerSummaryDTO;
  labels: ProductsDict["sheet"];
  common: CommonDict;
}) {
  const producerHref = localePath(locale, `/artisans/${producer.slug}`);

  return (
    <section aria-labelledby="producer-title" className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-soft">
      <h2 id="producer-title" className="text-xs font-bold tracking-[0.14em] text-brand-700 uppercase rtl:tracking-normal">
        {labels.producerTitle}
      </h2>

      <div className="mt-4 flex items-center gap-4">
        <CloudImage
          src={producer.imageUrl}
          alt=""
          fallbackIcon="leaf"
          sizes="64px"
          rounded="arch"
          className="h-20 w-16 shrink-0 ring-4 ring-brand-50"
        />
        <div className="min-w-0">
          <Badge tone="brand">{common.producerTypes[producer.type]}</Badge>
          <p className="mt-1.5 text-base leading-snug font-bold text-ink">
            <Link href={producerHref} className="underline-offset-4 hover:text-brand-800 hover:underline">
              {producer.name}
            </Link>
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-subtle">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            {placeLabel(producer.city, producer.governorate, locale)}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-4 text-sm font-semibold">
        <Link href={producerHref} className="text-brand-700 underline-offset-4 hover:text-brand-800 hover:underline">
          {labels.producerPage}
        </Link>
        <Link
          href={catalogHref(locale, { producer: producer.slug })}
          className="text-brand-700 underline-offset-4 hover:text-brand-800 hover:underline"
        >
          {labels.producerProducts}
        </Link>
      </div>
    </section>
  );
}
