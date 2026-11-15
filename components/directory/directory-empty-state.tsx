import { MapPinPlus, SearchX, Store } from "lucide-react";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { localePath } from "@/i18n/config";
import { interpolate } from "@/i18n/interpolate";
import { governorateLabel } from "@/lib/tunisia";
import type { Locale } from "@/types";

/** Texts of the empty results (dict.restaurants.results or dict.producers.results). */
type EmptyTexts = {
  emptyTitle: string;
  emptyText: string;
  noMatchTitle: string;
  noMatchText: string;
  notCoveredTitle: string; // contains {governorate}
  notCoveredText: string;
  suggest: string;
  seeAll: string;
};

/**
 * What to show when a directory list is empty:
 * - "notCovered": the chosen governorate has no address at all yet (spec EF-05) → clear
 *   message + "Proposer une adresse";
 * - "noMatch": the filters are too narrow → invite to change them;
 * - "empty": nothing published yet.
 */
export function DirectoryEmptyState({
  reason,
  governorate,
  locale,
  listPath,
  texts,
}: {
  reason: "empty" | "noMatch" | "notCovered";
  /** The chosen governorate (for the "notCovered" message) */
  governorate?: string;
  locale: Locale;
  /** Path of the list WITHOUT the language, e.g. "/restaurants" */
  listPath: string;
  texts: EmptyTexts;
}) {
  // EF-21: the contact form opens with the "Proposer une adresse" subject already chosen.
  const suggestHref = `${localePath(locale, "/contact")}?sujet=SUGGESTION`;
  const suggestLink = (
    <Link href={suggestHref} className={buttonStyles()}>
      <MapPinPlus aria-hidden="true" />
      {texts.suggest}
    </Link>
  );
  const seeAllLink = (
    <Link href={localePath(locale, listPath)} scroll={false} className={buttonStyles({ variant: "outline" })}>
      {texts.seeAll}
    </Link>
  );

  if (reason === "notCovered") {
    return (
      <EmptyState
        icon={<MapPinPlus />}
        title={interpolate(texts.notCoveredTitle, { governorate: governorateLabel(governorate ?? "", locale) })}
        description={texts.notCoveredText}
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            {suggestLink}
            {seeAllLink}
          </div>
        }
      />
    );
  }

  if (reason === "noMatch") {
    return (
      <EmptyState
        icon={<SearchX />}
        title={texts.noMatchTitle}
        description={texts.noMatchText}
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            {seeAllLink}
            {suggestLink}
          </div>
        }
      />
    );
  }

  return <EmptyState icon={<Store />} title={texts.emptyTitle} description={texts.emptyText} action={suggestLink} />;
}
