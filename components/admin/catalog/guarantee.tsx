import type { ChangeEvent } from "react";

import { GuaranteeBadge } from "@/components/ui/guarantee-badge";
import { cn } from "@/lib/utils";
import { isListedGuaranteeLevel, LISTED_GUARANTEE_LEVELS, type GuaranteeLevel, type ListedGuaranteeLevel } from "@/types";

import { GUARANTEE_LEVEL_INFO } from "./labels";

/** The guarantee level of a sheet as a colored badge (Certifié / 100 % sans gluten, or an older level). */
export function GuaranteeLevelBadge({ level, className }: { level: GuaranteeLevel; className?: string }) {
  return <GuaranteeBadge level={level} label={GUARANTEE_LEVEL_INFO[level].short} className={className} />;
}

/**
 * The guarantee levels a sheet can have as radio cards, each with its explanation (spec 5.2), so the
 * admin picks the right one. Policy "100 % sans gluten only": sends `name` = "CERTIFIED" | "DEDICATED".
 * A sheet saved with an older level (NATURALLY_GF, TRACES_RISK) shows it in a notice and must be
 * re-qualified with one of the two levels before it can be saved again.
 */
export function GuaranteeLevelField({
  name = "guaranteeLevel",
  defaultValue,
  error,
  onChange,
  className,
}: {
  name?: string;
  defaultValue?: string;
  error?: string | string[] | null;
  onChange?: (level: ListedGuaranteeLevel) => void;
  className?: string;
}) {
  const message = Array.isArray(error) ? error[0] : error;
  const errorId = `${name}-error`;
  const legacyId = `${name}-legacy`;
  // An older level that is no longer offered (the sheet was saved before the "100 % sans gluten" policy)
  const legacyLevel =
    defaultValue && !isListedGuaranteeLevel(defaultValue) && defaultValue in GUARANTEE_LEVEL_INFO
      ? (defaultValue as GuaranteeLevel)
      : null;

  return (
    <fieldset
      className={cn("min-w-0", className)}
      aria-describedby={[legacyLevel ? legacyId : null, message ? errorId : null].filter(Boolean).join(" ") || undefined}
      data-invalid={message ? "true" : undefined}
    >
      <legend className="text-sm font-semibold text-ink">
        Niveau de garantie sans gluten
        <span className="ms-0.5 text-red-600" aria-hidden="true">
          *
        </span>
      </legend>
      {legacyLevel ? (
        <p
          id={legacyId}
          className="mt-2 flex flex-wrap items-center gap-2 rounded-xl bg-saffron-50 px-3 py-2 text-xs leading-relaxed text-saffron-700 ring-1 ring-saffron-100"
        >
          Niveau enregistré :
          <GuaranteeBadge level={legacyLevel} label={GUARANTEE_LEVEL_INFO[legacyLevel].label} />
          Ce niveau n&apos;est plus proposé (CeliacCare ne référence que des commerces 100&nbsp;% sans gluten) : choisissez
          l&apos;un des deux niveaux ci-dessous.
        </p>
      ) : null}
      <div className="mt-2 grid gap-3 md:grid-cols-2">
        {LISTED_GUARANTEE_LEVELS.map((level) => (
          <label
            key={level}
            className="flex cursor-pointer gap-3 rounded-2xl border border-line bg-white p-4 transition-colors hover:border-brand-200 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50/50 has-[:checked]:ring-1 has-[:checked]:ring-brand-500 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand-600"
          >
            <input
              type="radio"
              name={name}
              value={level}
              required
              defaultChecked={defaultValue === level}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                if (event.target.checked) onChange?.(level);
              }}
              className="mt-0.5 size-4 shrink-0 cursor-pointer accent-brand-600 focus-visible:outline-none"
            />
            <span className="min-w-0">
              <GuaranteeBadge level={level} label={GUARANTEE_LEVEL_INFO[level].label} />
              <span className="mt-2 block text-xs leading-relaxed text-ink-muted">
                {GUARANTEE_LEVEL_INFO[level].description}
              </span>
            </span>
          </label>
        ))}
      </div>
      {message ? (
        <p id={errorId} className="mt-1.5 text-xs font-medium text-red-600" role="alert">
          {message}
        </p>
      ) : null}
    </fieldset>
  );
}
