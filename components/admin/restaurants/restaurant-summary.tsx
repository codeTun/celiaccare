import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { CloudImage } from "@/components/ui/cloud-image";
import { GuaranteeBadge } from "@/components/ui/guarantee-badge";
import { cn } from "@/lib/utils";
import type { GuaranteeLevel } from "@/types";

import { GUARANTEE_LABELS, RESTAURANT_ICON } from "./labels";

/**
 * Card at the top of the edit and menu pages: which restaurant this is (photo, name, city,
 * badges) and the actions given by the page (links, delete...).
 */
export function RestaurantSummary({
  restaurant,
  actions,
  className,
}: {
  restaurant: {
    name: string;
    slug: string;
    city: string;
    governorate: string;
    imageUrl: string | null;
    guaranteeLevel: GuaranteeLevel;
    isPartner: boolean;
    isActive: boolean;
  };
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <section
      aria-label={`Restaurant ${restaurant.name}`}
      className={cn(
        "mb-6 flex flex-col gap-4 rounded-[var(--radius-card)] border border-line bg-white p-4 shadow-soft sm:flex-row sm:items-center sm:p-5",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <CloudImage
          src={restaurant.imageUrl}
          alt=""
          sizes="64px"
          fallbackIcon={RESTAURANT_ICON}
          className="size-16 shrink-0"
          rounded="rounded-2xl"
        />
        <div className="min-w-0">
          <p className="truncate text-lg font-bold text-ink">{restaurant.name}</p>
          <p className="truncate text-sm text-ink-muted">
            {restaurant.city} · {restaurant.governorate}
            <span className="text-ink-subtle"> · /fr/restaurants/{restaurant.slug}</span>
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {restaurant.isPartner ? <Badge tone="saffron">Conventionné</Badge> : <Badge tone="neutral">Annuaire</Badge>}
            {restaurant.isActive ? <Badge tone="brand">Visible sur le site</Badge> : <Badge tone="neutral">Masqué du site</Badge>}
            <GuaranteeBadge level={restaurant.guaranteeLevel} label={GUARANTEE_LABELS[restaurant.guaranteeLevel].short} />
          </div>
        </div>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </section>
  );
}
