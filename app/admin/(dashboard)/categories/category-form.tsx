"use client";

import { FormGrid } from "@/components/admin/admin-form";
import { CatalogForm, type CatalogFormAction } from "@/components/admin/catalog/catalog-form";
import { ArabicSection, FormColumns, PhotoSection } from "@/components/admin/catalog/form-sections";
import { textValue } from "@/components/admin/catalog/form-values";
import { CategoryIconPicker } from "@/components/admin/catalog/icon-picker";
import { FormSection } from "@/components/admin/form-section";
import { TextareaField, TextField } from "@/components/ui/form";
import type { ActionState } from "@/lib/validators";
import type { AdminCategoryForm } from "@/types/admin-data";

type CategoryFormProps = {
  /** createCategoryAction, or updateCategoryAction.bind(null, id) (bound in the Server Component). */
  action: CatalogFormAction;
  /** The saved category (edit page) — undefined on the create page. */
  category?: AdminCategoryForm;
  /** icon key → name of the OTHER category using it (spec 6.3: one icon per category). */
  usedIcons: Record<string, string>;
  /** Pre-filled order of a new category (after the last one). */
  nextSortOrder?: number;
  cloudinaryReady: boolean;
  submitLabel: string;
};

/** Create / edit form of a category. */
export function CategoryForm({ action, submitLabel, ...props }: CategoryFormProps) {
  return (
    <CatalogForm action={action} cancelHref="/admin/categories" submitLabel={submitLabel}>
      {(state) => <CategoryFields state={state} {...props} />}
    </CatalogForm>
  );
}

function CategoryFields({
  state,
  category,
  usedIcons,
  nextSortOrder,
  cloudinaryReady,
}: Omit<CategoryFormProps, "action" | "submitLabel"> & { state: ActionState }) {
  const values = state.values;
  const errors = state.fieldErrors;

  return (
    <FormColumns
      main={
        <>
          <FormSection title="Informations" description="Le rayon tel qu'il apparaît dans le catalogue et ses filtres.">
            <FormGrid>
              <TextField
                name="name"
                label="Nom"
                required
                maxLength={80}
                placeholder="Pains & viennoiseries"
                defaultValue={textValue(values, "name", category?.name)}
                error={errors?.name}
                wrapperClassName="sm:col-span-2"
              />
              <TextField
                name="slug"
                label="Adresse de la page (slug)"
                maxLength={80}
                autoComplete="off"
                placeholder="pains-viennoiseries"
                hint="Laissez vide : elle est créée à partir du nom. Minuscules, chiffres et tirets."
                defaultValue={textValue(values, "slug", category?.slug)}
                error={errors?.slug}
                className="font-mono text-sm"
              />
              <TextField
                name="sortOrder"
                label="Ordre d'affichage"
                type="number"
                inputMode="numeric"
                min={0}
                max={9999}
                step={1}
                hint="Les plus petits nombres s'affichent en premier."
                defaultValue={textValue(values, "sortOrder", category?.sortOrder ?? nextSortOrder ?? 0)}
                error={errors?.sortOrder}
                className="tabular"
              />
              <TextareaField
                name="description"
                label="Description"
                rows={3}
                maxLength={600}
                hint="Une ou deux phrases, affichées en haut de la catégorie sur le site."
                defaultValue={textValue(values, "description", category?.description)}
                error={errors?.description}
                wrapperClassName="sm:col-span-2"
              />
            </FormGrid>
          </FormSection>

          <FormSection title="Icône" description="Elle permet de reconnaître la catégorie d'un coup d'œil, sur mobile surtout.">
            <CategoryIconPicker
              defaultValue={textValue(values, "icon", category?.icon) || undefined}
              savedValue={category?.icon}
              usedBy={usedIcons}
              error={errors?.icon}
            />
          </FormSection>

          <ArabicSection>
            <FormGrid>
              <TextField
                name="nameAr"
                label="Nom en arabe"
                dir="rtl"
                lang="ar"
                maxLength={80}
                placeholder="الخبز والمخبوزات"
                defaultValue={textValue(values, "nameAr", category?.nameAr)}
                error={errors?.nameAr}
                wrapperClassName="sm:col-span-2"
              />
              <TextareaField
                name="descriptionAr"
                label="Description en arabe"
                dir="rtl"
                lang="ar"
                rows={3}
                maxLength={600}
                defaultValue={textValue(values, "descriptionAr", category?.descriptionAr)}
                error={errors?.descriptionAr}
                wrapperClassName="sm:col-span-2"
              />
            </FormGrid>
          </ArabicSection>
        </>
      }
      side={
        <PhotoSection
          cloudinaryReady={cloudinaryReady}
          label="Photo de la catégorie (facultative)"
          description="Sans photo, l'icône est affichée sur un fond aux couleurs du site."
          currentUrl={category?.imageUrl}
          alt={category ? `Photo de la catégorie ${category.name}` : "Photo de la catégorie"}
          fallbackIcon={category?.icon}
          error={errors?.image}
        />
      }
    />
  );
}
