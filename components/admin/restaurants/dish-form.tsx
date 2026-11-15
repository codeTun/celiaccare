"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { FormActions, FormGrid, FormMessage } from "@/components/admin/admin-form";
import { FormSection } from "@/components/admin/form-section";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { MoneyField } from "@/components/admin/money-field";
import { SwitchField } from "@/components/admin/switch-field";
import { Alert } from "@/components/ui/alert";
import { TextareaField, TextField } from "@/components/ui/form";
import { idleState, type ActionState } from "@/lib/validators";
import { DISH_COURSES, type DishCourse } from "@/types";
import type { AdminDishForm, IngredientOption } from "@/types/admin-data";

import { IngredientChecklist } from "./ingredient-checklist";
import { COURSE_ICONS, COURSE_LABELS } from "./labels";

/**
 * Create / edit form of a dish of a restaurant menu.
 * `action` is the Server Action bound on the server (createDishAction.bind(null, restaurantId)
 * or updateDishAction.bind(null, dish.id)); it goes back to the menu on success.
 */
export function DishForm({
  action,
  dish,
  defaultCourse,
  ingredients,
  cloudinaryReady,
  cancelHref,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  /** The saved dish (edit) or null (new). */
  dish: AdminDishForm | null;
  /** Part of the menu pre-selected for a new dish. */
  defaultCourse: DishCourse;
  /** Every ingredient, for the checklist. */
  ingredients: IngredientOption[];
  cloudinaryReady: boolean;
  /** The menu page. */
  cancelHref: string;
}) {
  const [state, formAction] = useActionState(action, idleState);
  const formRef = useRef<HTMLFormElement>(null);
  const errors = state.fieldErrors ?? {};
  const isNew = dish === null;

  const text = (name: string, saved: string | number | null | undefined) =>
    state.values?.[name] ?? (saved == null ? "" : String(saved));
  const checked = (name: string, saved: boolean) => (state.values ? state.values[name] === "on" : saved);
  const course = text("course", dish?.course ?? defaultCourse);

  // The file field is emptied when the form comes back: remount the photo field (see RestaurantForm).
  const [photoKey, setPhotoKey] = useState(0);
  const [answeredState, setAnsweredState] = useState(state);
  if (state !== answeredState) {
    setAnsweredState(state);
    setPhotoKey((key) => key + 1);
  }
  const photoNotSaved = typeof state.data === "object" && state.data !== null && "photoNotSaved" in state.data;

  useEffect(() => {
    if (state.status !== "error") return;
    formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      <FormMessage state={state} />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-6">
          <FormSection id="plat" title="Le plat" description="Nom, partie du menu et prix affichés sur la fiche du restaurant.">
            <div className="space-y-5">
              <FormGrid>
                <TextField
                  name="name"
                  label="Nom du plat"
                  required
                  maxLength={120}
                  placeholder="Ex. Couscous au sorgho et à l'agneau"
                  defaultValue={text("name", dish?.name)}
                  error={errors.name}
                />
                <MoneyField
                  name="price"
                  label="Prix"
                  required
                  defaultMillimes={dish?.price}
                  defaultValue={state.values?.price}
                  error={errors.price}
                />
              </FormGrid>
              <CourseField defaultValue={course} error={errors.course} />
              <TextareaField
                name="description"
                label="Description"
                rows={3}
                maxLength={1000}
                placeholder="Ce qu'il contient, comment il est préparé…"
                defaultValue={text("description", dish?.description)}
                error={errors.description}
              />
            </div>
          </FormSection>

          <FormSection
            id="version-arabe"
            title="Version arabe (facultatif)"
            description="Affichée sur le site en arabe. Laissée vide, la version française est utilisée."
          >
            <FormGrid columns={1}>
              <TextField
                name="nameAr"
                label="اسم الطبق (Nom en arabe)"
                maxLength={120}
                dir="rtl"
                lang="ar"
                defaultValue={text("nameAr", dish?.nameAr)}
                error={errors.nameAr}
              />
              <TextareaField
                name="descriptionAr"
                label="الوصف (Description en arabe)"
                rows={3}
                maxLength={1000}
                dir="rtl"
                lang="ar"
                defaultValue={text("descriptionAr", dish?.descriptionAr)}
                error={errors.descriptionAr}
              />
            </FormGrid>
          </FormSection>

          <FormSection
            id="ingredients"
            title="Ingrédients et allergènes"
            description="Cochez les ingrédients principaux et TOUS les allergènes : ils sont affichés aux clients."
          >
            <IngredientChecklist options={ingredients} defaultSelected={dish?.ingredientIds ?? []} error={errors.ingredientIds} />
          </FormSection>
        </div>

        <div className="min-w-0 space-y-6">
          <FormSection id="affichage" title="Affichage">
            <div className="space-y-5">
              <SwitchField
                name="isAvailable"
                label="Disponible à la commande"
                description="Décochez quand le plat est épuisé : il reste visible mais ne peut plus être commandé."
                defaultChecked={checked("isAvailable", dish?.isAvailable ?? true)}
              />
              <TextField
                name="sortOrder"
                type="number"
                label="Ordre dans sa partie du menu"
                min={0}
                max={999}
                step={1}
                inputMode="numeric"
                hint="0 = en premier. Les plats de même ordre sont classés par nom."
                defaultValue={text("sortOrder", dish?.sortOrder ?? 0)}
                error={errors.sortOrder}
              />
            </div>
          </FormSection>

          <FormSection id="photo" title="Photo" description="Une photo appétissante, prise de près.">
            <div className="space-y-4">
              {cloudinaryReady ? null : (
                <Alert tone="warning">
                  Cloudinary n&apos;est pas configuré : ajoutez les clés CLOUDINARY_* dans .env pour envoyer des photos. Le reste
                  du plat est enregistré normalement.
                </Alert>
              )}
              <ImageUploadField
                key={photoKey}
                label="Photo du plat"
                currentUrl={dish?.imageUrl}
                alt={dish ? `Photo de ${dish.name}` : "Photo du plat"}
                fallbackIcon={COURSE_ICONS[(dish?.course ?? defaultCourse) as DishCourse]}
                error={errors.image}
              />
              {photoNotSaved ? (
                <p className="text-xs font-medium text-amber-800">
                  La photo choisie n&apos;a pas été enregistrée : sélectionnez-la à nouveau avant d&apos;enregistrer.
                </p>
              ) : null}
            </div>
          </FormSection>
        </div>
      </div>

      <FormActions
        cancelHref={cancelHref}
        submitLabel={isNew ? "Ajouter le plat" : "Enregistrer le plat"}
        pendingLabel={isNew ? "Ajout…" : "Enregistrement…"}
      >
        {state.status === "error" ? (
          <p className="text-sm font-medium text-red-600">Vérifiez les champs signalés en rouge.</p>
        ) : null}
      </FormActions>
    </form>
  );
}

/** Part of the menu (Entrée, Plat, Dessert, Boisson) as a row of radio pills. */
function CourseField({ defaultValue, error }: { defaultValue: string; error?: string[] }) {
  const message = error?.[0];
  return (
    <fieldset aria-describedby={message ? "course-error" : undefined}>
      <legend className="text-sm font-semibold text-ink">
        Partie du menu
        <span className="ms-0.5 text-red-600" aria-hidden="true">
          *
        </span>
      </legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {DISH_COURSES.map((course) => (
          <label
            key={course}
            className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-line-strong bg-white px-4 text-sm font-semibold text-ink-muted transition-colors hover:border-brand-300 has-[:checked]:border-brand-600 has-[:checked]:bg-brand-600 has-[:checked]:text-white has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-brand-100"
          >
            <input
              type="radio"
              name="course"
              value={course}
              required
              defaultChecked={defaultValue === course}
              className="sr-only"
            />
            {COURSE_LABELS[course].singular}
          </label>
        ))}
      </div>
      {message ? (
        <p id="course-error" className="mt-1.5 text-xs font-medium text-red-600" role="alert">
          {message}
        </p>
      ) : null}
    </fieldset>
  );
}
