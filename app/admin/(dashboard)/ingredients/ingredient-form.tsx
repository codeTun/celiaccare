"use client";

import { FormGrid } from "@/components/admin/admin-form";
import { CatalogForm, type CatalogFormAction } from "@/components/admin/catalog/catalog-form";
import { ArabicSection } from "@/components/admin/catalog/form-sections";
import { checkedValue, textValue, type SubmittedValues } from "@/components/admin/catalog/form-values";
import { FormSection } from "@/components/admin/form-section";
import { SwitchField } from "@/components/admin/switch-field";
import { TextField } from "@/components/ui/form";
import type { ActionState } from "@/lib/validators";
import type { AdminIngredientForm } from "@/types/admin-data";

type IngredientFormProps = {
  /** createIngredientAction, or updateIngredientAction.bind(null, id) (bound in the Server Component). */
  action: CatalogFormAction;
  /** The saved ingredient (edit page) — undefined to create one. */
  ingredient?: AdminIngredientForm;
  submitLabel: string;
  /** "page": full page with sections. "card": the quick-add card of the list (no slug field). */
  variant?: "page" | "card";
};

const ALLERGEN_HINT = "Lait, œufs, fruits à coque, arachide, sésame, soja, poisson… Il est signalé sur les fiches du site.";

/** Create / edit form of an ingredient. */
export function IngredientForm({ action, ingredient, submitLabel, variant = "page" }: IngredientFormProps) {
  return (
    <CatalogForm
      action={action}
      cancelHref={variant === "page" ? "/admin/ingredients" : undefined}
      submitLabel={submitLabel}
      pendingLabel={ingredient ? "Enregistrement…" : "Ajout…"}
      variant={variant}
    >
      {(state) =>
        variant === "card" ? <QuickAddFields state={state} /> : <IngredientFields state={state} ingredient={ingredient} />
      }
    </CatalogForm>
  );
}

function NameField({ values, saved, error, id }: { values: SubmittedValues; saved?: string; error?: string[]; id?: string }) {
  return (
    <TextField
      id={id}
      name="name"
      label="Nom"
      required
      maxLength={80}
      placeholder="Farine de riz"
      defaultValue={textValue(values, "name", saved)}
      error={error}
    />
  );
}

function ArabicNameField({
  values,
  saved,
  error,
  id,
  label = "Nom en arabe",
}: {
  values: SubmittedValues;
  saved?: string | null;
  error?: string[];
  id?: string;
  label?: string;
}) {
  return (
    <TextField
      id={id}
      name="nameAr"
      label={label}
      dir="rtl"
      lang="ar"
      maxLength={80}
      placeholder="دقيق الأرز"
      defaultValue={textValue(values, "nameAr", saved)}
      error={error}
    />
  );
}

/** Quick-add card of the list page: name, Arabic name, allergen. The slug is built from the name. */
function QuickAddFields({ state }: { state: ActionState }) {
  const values = state.values;
  const errors = state.fieldErrors;
  return (
    <FormGrid columns={3} className="gap-4">
      <NameField id="quick-ingredient-name" values={values} error={errors?.name} />
      <ArabicNameField
        id="quick-ingredient-name-ar"
        label="Nom en arabe (facultatif)"
        values={values}
        error={errors?.nameAr}
      />
      <SwitchField
        id="quick-ingredient-allergen"
        name="isAllergen"
        label="Allergène"
        description="Lait, œufs, fruits à coque, sésame…"
        defaultChecked={checkedValue(values, "isAllergen", false)}
        error={errors?.isAllergen}
        className="lg:mt-[1.65rem]"
      />
      {errors?.slug ? (
        <p className="text-xs font-medium text-red-600 sm:col-span-full" role="alert">
          {errors.slug[0]}
        </p>
      ) : null}
    </FormGrid>
  );
}

function IngredientFields({ state, ingredient }: { state: ActionState; ingredient?: AdminIngredientForm }) {
  const values = state.values;
  const errors = state.fieldErrors;
  return (
    <div className="max-w-3xl space-y-6">
      <FormSection title="Ingrédient" description="Tel qu'il apparaît dans la composition des produits et des plats.">
        <FormGrid>
          <NameField values={values} saved={ingredient?.name} error={errors?.name} />
          <TextField
            name="slug"
            label="Identifiant (slug)"
            maxLength={80}
            autoComplete="off"
            placeholder="farine-de-riz"
            hint="Laissez vide : il est créé à partir du nom. Sert aux filtres du catalogue (?ingredients=…)."
            defaultValue={textValue(values, "slug", ingredient?.slug)}
            error={errors?.slug}
            className="font-mono text-sm"
          />
          <SwitchField
            name="isAllergen"
            label="Allergène"
            description={ALLERGEN_HINT}
            defaultChecked={checkedValue(values, "isAllergen", ingredient?.isAllergen ?? false)}
            error={errors?.isAllergen}
            className="sm:col-span-2"
          />
        </FormGrid>
      </FormSection>
      <ArabicSection>
        <ArabicNameField values={values} saved={ingredient?.nameAr} error={errors?.nameAr} />
      </ArabicSection>
    </div>
  );
}
