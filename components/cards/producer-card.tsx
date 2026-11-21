import { MapPin, Package } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { CloudImage } from "@/components/ui/cloud-image";
import { GuaranteeBadge } from "@/components/ui/guarantee-badge";
import { localePath } from "@/i18n/config";
import type { CommonDict } from "@/i18n/resources/fr/common";
import { placeLabel } from "@/components/directory/place";
import { cn } from "@/lib/utils";
import type { Locale, ProducerCardDTO } from "@/types";

/** Artisan (small business) tile — the photo is framed like a Tunisian doorway. */
export function ProducerCard({
  producer,
  locale,
  common,
  productsLabel,
  className,
}: {
  producer: ProducerCardDTO;
  locale: Locale;
  common: CommonDict;
  /** e.g. "{count} produits" (an artisan without products online shows "Prix non publiés en ligne") */
  productsLabel: string;
  className?: string;
}) {
  const href = localePath(locale, `/artisans/${producer.slug}`);
  return (
    <article
      className={cn(
        "group relative flex flex-col items-center rounded-[var(--radius-card)] border border-line bg-white p-5 text-center transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift",
        // the link covers the whole card, so the card shows the keyboard focus
        "has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-brand-600",
        className,
      )}
    >
      <CloudImage
        src={producer.imageUrl}
        alt=""
        fallbackIcon="leaf"
        sizes="(min-width: 1024px) 18vw, (min-width: 640px) 30vw, 60vw"
        rounded="arch"
        className="aspect-[4/5] w-full max-w-52 ring-4 ring-brand-50"
        imageClassName="transition duration-500 group-hover:scale-[1.03]"
      />
      {/* may wrap: "مصنّع منتجات خالية من الغلوتين" is wider than a card of the 2-column grid at 320 px */}
      <Badge tone="brand" className="mt-4 max-w-full text-center whitespace-normal">
        {common.producerTypes[producer.type]}
      </Badge>
      <h3 className="mt-2 text-base leading-snug font-bold text-ink">
        <Link href={href} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
          {producer.name}
        </Link>
      </h3>
      <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-ink-subtle">
        <MapPin className="size-3.5" aria-hidden="true" />
        {placeLabel(producer.city, producer.governorate, locale)}
      </p>
      {producer.description ? (
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-muted">{producer.description}</p>
      ) : null}
      <div className="mt-auto flex flex-wrap items-center justify-center gap-2 pt-4">
        <GuaranteeBadge level={producer.guaranteeLevel} label={common.guarantee[producer.guaranteeLevel].short} />
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink-muted">
          <Package className="size-3.5" aria-hidden="true" />
          {producer.productCount > 0
            ? productsLabel.replace("{count}", String(producer.productCount))
            : common.labels.pricesNotPublished}
        </span>
      </div>
    </article>
  );
}
