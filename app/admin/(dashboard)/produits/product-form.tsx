"use client";

import { ExternalLink } from "lucide-react";
import { useState } from "react";

import { FormGrid } from "@/components/admin/admin-form";
import { CatalogForm, type CatalogFormAction } from "@/components/admin/catalog/catalog-form";
import { ArabicSection, FormColumns, PhotoSection, VerificationSection } from "@/components/admin/catalog/form-sections";
import { checkedValue, idsValue, textValue, type SubmittedValues } from "@/components/admin/catalog/form-values";
import { GuaranteeLevelField } from "@/components/admin/catalog/guarantee";
import { IngredientPicker } from "@/components/admin/catalog/ingredient-picker";
import { FormSection } from "@/components/admin/form-section";
import { MoneyField } from "@/components/admin/money-field";
import { SelectOptions } from "@/components/admin/select-fields";
import { SwitchField } from "@/components/admin/switch-field";
import { SelectField, TextareaField, TextField } from "@/components/ui/form";
import { formatDate } from "@/lib/format";
import type { ActionState } from "@/lib/validators";
import type { AdminProductForm, IngredientOption } from "@/types/admin-data";

/** An artisan in the "Artisan" select, with the verification of its sheet (the product inherits its source). */
export type ProducerChoice = {
  id: number;
  name: string;
  city: string;
  isActive: boolean;
  verificationSource: string;
  verifiedAt: string;
};

type ProductFormProps = {
  /** createProductAction, or updateProductAction.bind(null, id) (bound in the Server Component). */
  action: CatalogFormAction;
  /** The saved product (edit page) — undefined on the create page. */
  product?: AdminProductForm;
  categories: { id: number; name: string; icon: string }[];
  producers: ProducerChoice[];
  ingredients: IngredientOption[];
  /** Today in Tunis ("YYYY-MM-DD"): default and latest verification date. */
  today: string;
  cloudinaryReady: boolean;
  submitLabel: string;
};

/** Create / edit form of a product (spec 5.3 "fiche produit"). */
export function ProductForm({ action, submitLabel, ...props }: ProductFormProps) {
  return (
    <CatalogForm action={action} cancelHref="/admin/produits" submitLabel={submitLabel}>
      {(state) => <ProductFields state={state} {...props} />}
    </CatalogForm>
  );
}

function ProductFields({
  state,
  product,
  categories,
  producers,
  ingredients,
  today,
  cloudinaryReady,
}: Omit<ProductFormProps, "action" | "submitLabel"> & { state: ActionState }) {
  const values = state.values;
  const errors = state.fieldErrors;
  // Followed live: the certification becomes required for "Certifié", the verification source follows the artisan.
  const [level, setLevel] = useState(textValue(values, "guaranteeLevel", product?.guaranteeLevel));
  const [producerId, setProducerId] = useState(Number(textValue(values, "producerId", product?.producerId)) || null);
  const [categoryId, setCategoryId] = useState(Number(textValue(values, "categoryId", product?.categoryId)) || null);

  const producer = producers.find((item) => item.id === producerId) ?? null;
  const categoryIcon = categories.find((item) => item.id === categoryId)?.icon;
  const activeProducers = producers.filter((item) => item.isActive);
  const hiddenProducers = producers.filter((item) => !item.isActive);
  const certified = level === "CERTIFIED";

  return (
    <FormColumns
      main={
        <>
          <FormSection title="Informations" description="Ce que les visiteurs voient sur la fiche du produit.">
            <FormGrid>
              <TextField
                name="name"
                label="Nom du produit"
                required
                maxLength={120}
                placeholder="Pain de mie au riz et sorgho"
                defaultValue={textValue(values, "name", product?.name)}
                error={errors?.name}
                wrapperClassName="sm:col-span-2"
              />
              <TextareaField
                name="description"
                label="Description"
                required
                rows={5}
                maxLength={3000}
                hint="Goût, utilisation, conservation… Les ingrédients sont cochés plus bas."
                defaultValue={textValue(values, "description", product?.description)}
                error={errors?.description}
                wrapperClassName="sm:col-span-2"
              />
              <MoneyField
                name="price"
                label="Prix"
                required
                hint="En dinars, ex. 12,500"
                defaultMillimes={product?.price}
                defaultValue={values?.price}
                error={errors?.price}
              />
              <TextField
                name="unit"
                label="Conditionnement"
                maxLength={60}
                placeholder="500 g, La pièce, Boîte de 12…"
                defaultValue={textValue(values, "unit", product?.unit)}
                error={errors?.unit}
              />
              <SelectField
                name="categoryId"
                label="Catégorie"
                required
                defaultValue={textValue(values, "categoryId", product?.categoryId)}
                error={errors?.categoryId}
                onChange={(event) => setCategoryId(Number(event.target.value) || null)}
              >
                <SelectOptions
                  placeholder="Choisir une catégorie…"
                  options={categories.map((item) => ({ value: String(item.id), label: item.name }))}
                />
              </SelectField>
              <SelectField
                name="producerId"
                label="Artisan"
                required
                defaultValue={textValue(values, "producerId", product?.producerId)}
                error={errors?.producerId}
                onChange={(event) => setProducerId(Number(event.target.value) || null)}
              >
                <option value="">Choisir un artisan…</option>
                <optgroup label="Artisans visibles sur le site">
                  {activeProducers.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} — {item.city}
                    </option>
                  ))}
                </optgroup>
                {hiddenProducers.length > 0 ? (
                  <optgroup label="Artisans masqués">
                    {hiddenProducers.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} — {item.city} (masqué)
                      </option>
                    ))}
                  </optgroup>
                ) : null}
              </SelectField>
              <TextField
                name="slug"
                label="Adresse de la page (slug)"
                maxLength={80}
                autoComplete="off"
                placeholder="pain-de-mie-riz-sorgho"
                hint="Laissez vide : elle est créée à partir du nom (un numéro est ajouté si elle existe déjà)."
                defaultValue={textValue(values, "slug", product?.slug)}
                error={errors?.slug}
                className="font-mono text-sm"
                wrapperClassName="sm:col-span-2"
              />
            </FormGrid>
          </FormSection>

          <FormSection
            title="Ingrédients"
            description="Cochez tous les ingrédients de l'étiquette. Les allergènes sont signalés en rouge sur la fiche."
          >
            <IngredientPicker
              options={ingredients}
              defaultSelected={idsValue(values, "ingredientIds", product?.ingredientIds ?? [])}
              error={errors?.ingredientIds}
            />
          </FormSection>

          <FormSection title="Garantie" description="Affichée sur la fiche et dans les filtres du catalogue.">
            <div className="space-y-5">
              <GuaranteeLevelField
                defaultValue={level || undefined}
                error={errors?.guaranteeLevel}
                onChange={(next) => setLevel(next)}
              />
              <FormGrid>
                <TextField
                  name="certification"
                  label="Certification"
                  required={certified}
                  maxLength={200}
                  placeholder="INNORPI — n° 2026-114"
                  hint={
                    certified
                      ? "Obligatoire pour un produit certifié : organisme et numéro du certificat."
                      : "Organisme et numéro, si le produit est certifié."
                  }
                  defaultValue={textValue(values, "certification", product?.certification)}
                  error={errors?.certification}
                />
                <TextField
                  name="mayContain"
                  label="Peut contenir des traces de"
                  maxLength={300}
                  placeholder="fruits à coque, sésame"
                  hint="Mention de l'étiquette sur les traces possibles."
                  defaultValue={textValue(values, "mayContain", product?.mayContain)}
                  error={errors?.mayContain}
                />
              </FormGrid>
            </div>
          </FormSection>

          <ArabicSection>
            <FormGrid>
              <TextField
                name="nameAr"
                label="Nom en arabe"
                dir="rtl"
                lang="ar"
                maxLength={120}
                defaultValue={textValue(values, "nameAr", product?.nameAr)}
                error={errors?.nameAr}
                wrapperClassName="sm:col-span-2"
              />
              <TextareaField
                name="descriptionAr"
                label="Description en arabe"
                dir="rtl"
                lang="ar"
                rows={5}
                maxLength={3000}
                defaultValue={textValue(values, "descriptionAr", product?.descriptionAr)}
                error={errors?.descriptionAr}
                wrapperClassName="sm:col-span-2"
              />
            </FormGrid>
          </ArabicSection>
        </>
      }
      side={
        <>
          <PublicationSection values={values} product={product} />
          <VerificationSection
            inheritedSource={<InheritedSource producer={producer} />}
            date={textValue(values, "verifiedAt", product?.verifiedAt ?? today)}
            dateError={errors?.verifiedAt}
            today={today}
          />
          <PhotoSection
            cloudinaryReady={cloudinaryReady}
            label="Photo du produit"
            description="Idéalement l'emballage, avec l'étiquette lisible."
            currentUrl={product?.imageUrl}
            alt={product ? `Photo de ${product.name}` : "Photo du produit"}
            fallbackIcon={categoryIcon}
            error={errors?.image}
          />
        </>
      }
    />
  );
}

function PublicationSection({ values, product }: { values: SubmittedValues; product?: AdminProductForm }) {
  return (
    <FormSection title="Publication">
      <div className="space-y-3">
        <SwitchField
          name="isActive"
          label="Visible sur le site"
          description="Décochez pour masquer le produit sans le supprimer."
          defaultChecked={checkedValue(values, "isActive", product?.isActive ?? true)}
        />
        <SwitchField
          name="isAvailable"
          label="Disponible à la commande"
          description="Décochez en cas de rupture : la fiche reste visible."
          defaultChecked={checkedValue(values, "isAvailable", product?.isAvailable ?? true)}
        />
        <SwitchField
          name="isFeatured"
          label="En vedette"
          description="Mis en avant sur la page d'accueil."
          defaultChecked={checkedValue(values, "isFeatured", product?.isFeatured ?? false)}
        />
      </div>
    </FormSection>
  );
}

/** Products have no source field of their own: the source of their artisan's sheet applies. */
function InheritedSource({ producer }: { producer: ProducerChoice | null }) {
  return (
    <div className="rounded-2xl border border-line bg-canvas/60 p-3.5 text-sm">
      <p className="font-semibold text-ink">Source de vérification</p>
      {producer ? (
        <>
          <p className="mt-1 leading-relaxed text-ink-muted">
            Celle de la fiche de l&apos;artisan : « {producer.verificationSource} », le {formatDate(producer.verifiedAt)}.
          </p>
          <a
            href={`/admin/artisans/${producer.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline"
          >
            Ouvrir la fiche de {producer.name}
            <ExternalLink className="size-3.5" aria-hidden="true" />
            <span className="sr-only">(nouvel onglet)</span>
          </a>
        </>
      ) : (
        <p className="mt-1 leading-relaxed text-ink-muted">
          Choisissez l&apos;artisan : la source de vérification de sa fiche s&apos;applique au produit.
        </p>
      )}
    </div>
  );
}
