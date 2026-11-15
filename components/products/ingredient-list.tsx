import { TriangleExclamationPoint } from "lucide-react";

import { interpolate } from "@/i18n/interpolate";
import type { ProductsDict } from "@/i18n/resources/fr/products";
import { cn } from "@/lib/utils";
import type { IngredientDTO, Locale } from "@/types";

import { FrenchText } from "./french-text";

/**
 * Ingredients of a product as chips (allergens in red), the "Allergènes : ..." line,
 * the possible traces and the label warning required on every product sheet (spec 5.3).
 */
export function IngredientList({
  locale,
  ingredients,
  mayContain,
  labels,
}: {
  locale: Locale;
  ingredients: IngredientDTO[];
  /** Free text, e.g. "blé et orge (moulin partagé)" */
  mayContain: string | null;
  labels: ProductsDict["sheet"];
}) {
  const allergens = ingredients.filter((ingredient) => ingredient.isAllergen);
  // "Amandes et Beurre" / "لوز وزبدة"
  const allergenList = new Intl.ListFormat(locale, { style: "long", type: "conjunction" }).format(
    allergens.map((allergen) => allergen.name),
  );
  // "Peut contenir des traces de : {list}" — the traces are typed in French only (no Arabic column yet)
  const [mayContainBefore, mayContainAfter = ""] = labels.mayContain.split("{list}");

  return (
    <div>
      {ingredients.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {ingredients.map((ingredient) => (
            <li
              key={ingredient.id}
              className={cn(
                "inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 text-sm font-medium ring-1",
                ingredient.isAllergen ? "bg-red-50 text-red-700 ring-red-200" : "bg-white text-ink-muted ring-line-strong",
              )}
            >
              {ingredient.isAllergen ? <TriangleExclamationPoint className="size-3.5 shrink-0" aria-hidden="true" /> : null}
              {ingredient.name}
              {ingredient.isAllergen ? <span className="sr-only"> ({labels.allergenTag})</span> : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-subtle">{labels.ingredientsEmpty}</p>
      )}

      <p className={cn("mt-4 text-sm font-semibold", allergens.length > 0 ? "text-red-700" : "text-ink-muted")}>
        {allergens.length > 0
          ? interpolate(labels.allergensLine, { list: allergenList })
          : labels.noAllergens}
      </p>

      {mayContain ? (
        <p className="mt-1.5 text-sm text-amber-800">
          {mayContainBefore}
          <FrenchText locale={locale}>{mayContain}</FrenchText>
          {mayContainAfter}
        </p>
      ) : null}

      <p className="mt-5 flex items-start gap-2.5 rounded-2xl bg-saffron-50 px-4 py-3 text-sm font-semibold text-saffron-700 ring-1 ring-saffron-100">
        <TriangleExclamationPoint className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        {labels.labelWarning}
      </p>
    </div>
  );
}
