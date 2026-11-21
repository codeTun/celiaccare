import { ClipboardList, Clock, MapPin } from "lucide-react";
import type { ReactNode } from "react";

import { GuaranteeBadge } from "@/components/ui/guarantee-badge";
import type { CommonDict } from "@/i18n/resources/fr/common";
import { cn } from "@/lib/utils";
import type { GuaranteeLevel, Locale } from "@/types";

import type { SheetLabels } from "./labels";
import { placeLabel } from "./place";
import { PracticesList, type PracticeItem } from "./practices-list";
import { VerificationNote } from "./verification-note";

/**
 * What the sheet shows. RestaurantDetailDTO and ProducerDetailDTO both fit this shape.
 * No phone, e-mail, website or social network of the business: every purchase goes through CeliacCare.
 */
export type SheetPlace = {
  name: string;
  address: string | null;
  city: string;
  governorate: string;
  openingHours: string | null;
  guaranteeLevel: GuaranteeLevel;
  verificationSource: string;
  verifiedAt: string;
  needsReview: boolean;
};

/**
 * The "fiche adresse" card (spec 5.2), shared by the restaurant and artisan pages:
 * address, opening hours (+ `extraRows`), guarantee level, preparation practices,
 * source and date of the last check (plain text), and a `footer` (the "Signaler une erreur" button).
 * The business's own contacts are never shown: visitors order and ask questions through CeliacCare.
 */
export function InfoSheet({
  place,
  practices,
  locale,
  common,
  labels,
  extraRows,
  footer,
  className,
}: {
  place: SheetPlace;
  practices: PracticeItem[];
  locale: Locale;
  common: CommonDict;
  labels: SheetLabels;
  /** More <InfoRow> lines after the opening hours (e.g. the price range) */
  extraRows?: ReactNode;
  /** Bottom of the card, e.g. the report button */
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <section
      aria-labelledby="sheet-title"
      className={cn("rounded-[var(--radius-card)] border border-line bg-white shadow-soft", className)}
    >
      <header className="flex items-center gap-3 border-b border-line px-5 py-4">
        <span className="grid size-9 place-items-center rounded-full bg-brand-50 text-brand-700" aria-hidden="true">
          <ClipboardList className="size-[18px]" />
        </span>
        <h2 id="sheet-title" className="text-base font-bold text-ink">
          {labels.title}
        </h2>
      </header>

      <dl className="divide-y divide-line px-5">
        <InfoRow icon={<MapPin />} label={common.labels.address}>
          {/* <bdi>: a French address keeps its word order on Arabic pages ("18, rue ...") */}
          {place.address ? (
            <span className="block">
              <bdi>{place.address}</bdi>
            </span>
          ) : null}
          {placeLabel(place.city, place.governorate, locale)}
        </InfoRow>

        {place.openingHours ? (
          <InfoRow icon={<Clock />} label={common.labels.hours}>
            <span className="whitespace-pre-line">{place.openingHours}</span>
          </InfoRow>
        ) : null}

        {extraRows}
      </dl>

      <div className="space-y-6 border-t border-line px-5 py-5">
        <div>
          <h3 className="text-sm font-bold text-ink">{common.guarantee.title}</h3>
          <GuaranteeBadge
            level={place.guaranteeLevel}
            label={common.guarantee[place.guaranteeLevel].label}
            size="md"
            className="mt-2.5"
          />
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            {common.guarantee[place.guaranteeLevel].description}
          </p>
        </div>

        <PracticesList
          title={common.practices.title}
          items={practices}
          yesLabel={labels.yes}
          noLabel={labels.notDeclared}
          noneText={common.practices.none}
        />

        <VerificationNote
          source={place.verificationSource}
          verifiedAt={place.verifiedAt}
          needsReview={place.needsReview}
          locale={locale}
          common={common}
        />
      </div>

      {footer ? (
        <div className="rounded-b-[var(--radius-card)] border-t border-line bg-canvas/70 px-5 py-4">{footer}</div>
      ) : null}
    </section>
  );
}

/** One line of the sheet: an icon, a small label and the value. Use it inside <InfoSheet extraRows>. */
export function InfoRow({ icon, label, children }: { icon: ReactNode; label: ReactNode; children: ReactNode }) {
  return (
    <div className="flex gap-3 py-3.5">
      <span className="mt-0.5 shrink-0 text-brand-600 [&_svg]:size-[18px]" aria-hidden="true">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <dt className="text-xs font-semibold text-ink-subtle">{label}</dt>
        <dd className="mt-0.5 text-sm leading-relaxed text-ink">{children}</dd>
      </div>
    </div>
  );
}
