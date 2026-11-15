import type { ChangeEvent } from "react";

import { GuaranteeBadge } from "@/components/ui/guarantee-badge";
import { cn } from "@/lib/utils";
import { GUARANTEE_LEVELS, type GuaranteeLevel } from "@/types";

import { GUARANTEE_LEVEL_INFO } from "./labels";

/** The guarantee level of a sheet as a colored badge (Certifié / Sans gluten / Traces possibles). */
export function GuaranteeLevelBadge({ level, className }: { level: GuaranteeLevel; className?: string }) {
  return <GuaranteeBadge level={level} label={GUARANTEE_LEVEL_INFO[level].short} className={className} />;
}

/**
 * The 3 guarantee levels as radio cards, each with its explanation (spec 5.2), so the
 * admin picks the right one. Sends `name` = "CERTIFIED" | "NATURALLY_GF" | "TRACES_RISK".
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
  onChange?: (level: GuaranteeLevel) => void;
  className?: string;
}) {
  const message = Array.isArray(error) ? error[0] : error;
  const errorId = `${name}-error`;

  return (
    <fieldset
      className={cn("min-w-0", className)}
      aria-describedby={message ? errorId : undefined}
      data-invalid={message ? "true" : undefined}
    >
      <legend className="text-sm font-semibold text-ink">
        Niveau de garantie sans gluten
        <span className="ms-0.5 text-red-600" aria-hidden="true">
          *
        </span>
      </legend>
      <div className="mt-2 grid gap-3 lg:grid-cols-3">
        {GUARANTEE_LEVELS.map((level) => (
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
