import { ArrowDown, MapPin, Package } from "lucide-react";

import { ContactButtons } from "@/components/directory/contact-buttons";
import { DetailHero } from "@/components/directory/detail-hero";
import { placeLabel } from "@/components/directory/place";
import { LogoEmblem } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { CloudImage } from "@/components/ui/cloud-image";
import { GuaranteeBadge } from "@/components/ui/guarantee-badge";
import { interpolate } from "@/i18n/interpolate";
import type { CommonDict } from "@/i18n/resources/fr/common";
import type { ProducersDict } from "@/i18n/resources/fr/producers";
import type { Locale, ProducerDetailDTO } from "@/types";

import { PRODUCER_TYPE_ICONS } from "./producer-type-icons";

/**
 * Top of an artisan page: photo in a Tunisian doorway frame, kind of business,
 * name (the page's <h1>), city, guarantee level and the contact buttons.
 */
export function ProducerHeader({
  producer,
  locale,
  common,
  dict,
}: {
  producer: ProducerDetailDTO;
  locale: Locale;
  common: CommonDict;
  dict: ProducersDict;
}) {
  const TypeIcon = PRODUCER_TYPE_ICONS[producer.type];
  const hasProducts = producer.productCount > 0;

  return (
    <DetailHero
      lang={locale}
      breadcrumbs={[
        { label: common.nav.producers, href: "/artisans" },
        { label: producer.name, href: `/artisans/${producer.slug}` },
      ]}
    >
      <div className="grid items-center gap-8 md:grid-cols-[auto_minmax(0,1fr)] md:gap-12 lg:gap-16">
        <div className="relative w-fit">
          {/* jasmine doorway watermark behind the photo */}
          <LogoEmblem className="absolute -start-8 -bottom-6 -z-10 size-40 opacity-[0.07]" />
          <CloudImage
            src={producer.imageUrl}
            alt={producer.name}
            fallbackIcon="leaf"
            sizes="(min-width: 1024px) 16rem, (min-width: 640px) 14rem, 11rem"
            preload
            rounded="arch"
            className="aspect-[4/5] w-44 shadow-lift ring-8 ring-white sm:w-56 lg:w-64"
          />
        </div>

        <div className="min-w-0">
          <Badge tone="brand" className="px-3 py-1 text-sm">
            <TypeIcon aria-hidden="true" />
            {common.producerTypes[producer.type]}
          </Badge>

          <h1 className="mt-4 text-3xl leading-[1.1] font-extrabold text-ink sm:text-4xl lg:text-5xl">{producer.name}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4 text-brand-600" aria-hidden="true" />
              {placeLabel(producer.city, producer.governorate, locale)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Package className="size-4 text-brand-600" aria-hidden="true" />
              {interpolate(producer.productCount === 1 ? dict.results.productsOne : dict.results.productsOther, {
                count: producer.productCount,
              })}
            </span>
          </div>

          <GuaranteeBadge
            level={producer.guaranteeLevel}
            label={common.guarantee[producer.guaranteeLevel].label}
            size="md"
            className="mt-5"
          />

          <div className="mt-7 flex flex-wrap items-center gap-2">
            {hasProducts ? (
              <a href="#produits" className={buttonStyles({ size: "lg", className: "w-full sm:w-auto" })}>
                {dict.page.seeProducts}
                <ArrowDown aria-hidden="true" />
              </a>
            ) : null}
            <ContactButtons
              contact={producer}
              common={common}
              labels={dict.sheet}
              primary={hasProducts ? undefined : "call"}
              className="w-full sm:w-auto"
            />
          </div>
        </div>
      </div>
    </DetailHero>
  );
}
