"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { FormActions, FormGrid, FormMessage } from "@/components/admin/admin-form";
import { DateField } from "@/components/admin/date-field";
import { FormSection } from "@/components/admin/form-section";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { MoneyField } from "@/components/admin/money-field";
import { EnumSelectField, GovernorateSelectField } from "@/components/admin/select-fields";
import { SwitchField } from "@/components/admin/switch-field";
import { Alert } from "@/components/ui/alert";
import { TextareaField, TextField } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { idleState, type ActionState } from "@/lib/validators";
import { GUARANTEE_LEVELS, type GuaranteeLevel } from "@/types";
import type { AdminRestaurantForm } from "@/types/admin-data";

import { DEFAULT_DELIVERY_TIME, GUARANTEE_LABELS, PRICE_RANGE_LABELS } from "./labels";

const PRICE_RANGE_OPTIONS = [
  { value: "1", label: `1 · ${PRICE_RANGE_LABELS[1]}` },
  { value: "2", label: `2 · ${PRICE_RANGE_LABELS[2]}` },
  { value: "3", label: `3 · ${PRICE_RANGE_LABELS[3]}` },
];

/** Values of a new restaurant (same defaults as the database). */
const NEW_RESTAURANT_DEFAULTS = {
  priceRange: 2,
  deliveryFee: 3000,
  deliveryTime: DEFAULT_DELIVERY_TIME,
  minOrder: 0,
};

/**
 * Create / edit form of a partner restaurant.
 * `action` is the Server Action, bound on the server for an edit
 * (updateRestaurantAction.bind(null, restaurant.id)); it redirects to the list on success.
 */
export function RestaurantForm({
  action,
  restaurant,
  cloudinaryReady,
  today,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  /** The saved restaurant (edit) or null (new). */
  restaurant: AdminRestaurantForm | null;
  /** false → photos cannot be uploaded (CLOUDINARY_* keys missing). */
  cloudinaryReady: boolean;
  /** Today in Tunis, "YYYY-MM-DD": the latest date allowed. */
  today: string;
}) {
  const [state, formAction] = useActionState(action, idleState);
  const formRef = useRef<HTMLFormElement>(null);
  const errors = state.fieldErrors ?? {};
  const isNew = restaurant === null;

  /** Text value: what was just submitted (after an error), else the saved value. */
  const text = (name: string, saved: string | number | null | undefined) =>
    state.values?.[name] ?? (saved == null ? "" : String(saved));
  /** Checkbox value: what was just submitted (after an error), else the saved value. */
  const checked = (name: string, saved: boolean) => (state.values ? state.values[name] === "on" : saved);

  const [isPartner, setIsPartner] = useState(() => checked("isPartner", restaurant?.isPartner ?? false));

  // The file field is emptied when the form comes back: remount the photo field so its
  // preview does not show a photo that will not be sent.
  const [photoKey, setPhotoKey] = useState(0);
  const [answeredState, setAnsweredState] = useState(state);
  if (state !== answeredState) {
    setAnsweredState(state);
    setPhotoKey((key) => key + 1);
  }
  const photoNotSaved = typeof state.data === "object" && state.data !== null && "photoNotSaved" in state.data;

  // After a server error, bring the first invalid field into view.
  useEffect(() => {
    if (state.status !== "error") return;
    formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      <FormMessage state={state} />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        {/* ---------------- Main column ---------------- */}
        <div className="min-w-0 space-y-6">
          <FormSection id="identite" title="Identité" description="Ce que les visiteurs voient en premier sur la fiche du restaurant.">
            <FormGrid>
              <TextField
                name="name"
                label="Nom du restaurant"
                required
                maxLength={120}
                placeholder="Ex. Dar El Ward"
                defaultValue={text("name", restaurant?.name)}
                error={errors.name}
              />
              <TextField
                name="cuisine"
                label="Type de cuisine"
                maxLength={80}
                placeholder="Tunisienne, italienne, pâtisserie…"
                defaultValue={text("cuisine", restaurant?.cuisine)}
                error={errors.cuisine}
              />
              <TextField
                name="slug"
                label="Adresse de la fiche (slug)"
                maxLength={80}
                pattern="[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*"
                placeholder="dar-el-ward"
                hint={
                  isNew
                    ? "Laissez vide : elle est créée à partir du nom. Minuscules, chiffres et tirets."
                    : "Minuscules, chiffres et tirets. Attention : la changer modifie le lien de la fiche."
                }
                defaultValue={text("slug", restaurant?.slug)}
                error={errors.slug}
                wrapperClassName="sm:col-span-2"
              />
              <TextareaField
                name="description"
                label="Description"
                rows={5}
                maxLength={3000}
                placeholder="L'ambiance, les spécialités, les précautions prises en cuisine…"
                defaultValue={text("description", restaurant?.description)}
                error={errors.description}
                wrapperClassName="sm:col-span-2"
              />
            </FormGrid>
          </FormSection>

          <FormSection
            id="version-arabe"
            title="Version arabe (facultatif)"
            description="Affichée sur le site en arabe. Laissée vide, la version française est utilisée. Le nom reste le même dans les deux langues."
          >
            <TextareaField
              name="descriptionAr"
              label="الوصف (Description en arabe)"
              rows={5}
              maxLength={3000}
              dir="rtl"
              lang="ar"
              defaultValue={text("descriptionAr", restaurant?.descriptionAr)}
              error={errors.descriptionAr}
            />
          </FormSection>

          <FormSection id="adresse" title="Adresse" description="Où se trouve le restaurant. Les coordonnées GPS placent la fiche sur la carte.">
            <FormGrid>
              <GovernorateSelectField
                name="governorate"
                label="Gouvernorat"
                required
                defaultValue={text("governorate", restaurant?.governorate)}
                error={errors.governorate}
              />
              <TextField
                name="city"
                label="Ville ou quartier"
                required
                maxLength={80}
                placeholder="Ex. La Marsa"
                defaultValue={text("city", restaurant?.city)}
                error={errors.city}
              />
              <TextField
                name="address"
                label="Adresse"
                required
                maxLength={200}
                placeholder="Ex. 7, rue du Pacha, Médina de Tunis"
                defaultValue={text("address", restaurant?.address)}
                error={errors.address}
                wrapperClassName="sm:col-span-2"
              />
              <TextField
                name="latitude"
                label="Latitude"
                inputMode="decimal"
                placeholder="36.8065"
                hint="Sur Google Maps : clic droit sur le lieu, puis cliquez sur les coordonnées pour les copier."
                defaultValue={text("latitude", restaurant?.latitude)}
                error={errors.latitude}
              />
              <TextField
                name="longitude"
                label="Longitude"
                inputMode="decimal"
                placeholder="10.1815"
                defaultValue={text("longitude", restaurant?.longitude)}
                error={errors.longitude}
              />
            </FormGrid>
          </FormSection>

          <FormSection id="contacts" title="Contacts" description="Affichés sur la fiche pour appeler, écrire ou suivre le restaurant.">
            <FormGrid>
              <TextField
                name="phone"
                type="tel"
                label="Téléphone"
                required
                autoComplete="off"
                placeholder="71 123 456"
                defaultValue={text("phone", restaurant?.phone)}
                error={errors.phone}
              />
              <TextField
                name="whatsapp"
                type="tel"
                label="WhatsApp"
                autoComplete="off"
                placeholder="98 123 456"
                defaultValue={text("whatsapp", restaurant?.whatsapp)}
                error={errors.whatsapp}
              />
              <TextField
                name="email"
                type="email"
                label="E-mail"
                autoComplete="off"
                placeholder="contact@restaurant.tn"
                defaultValue={text("email", restaurant?.email)}
                error={errors.email}
              />
              <TextField
                name="website"
                type="url"
                label="Site web"
                placeholder="https://…"
                defaultValue={text("website", restaurant?.website)}
                error={errors.website}
              />
              <TextField
                name="instagram"
                label="Instagram"
                maxLength={200}
                placeholder="@restaurant ou lien complet"
                defaultValue={text("instagram", restaurant?.instagram)}
                error={errors.instagram}
              />
              <TextField
                name="facebook"
                label="Facebook"
                maxLength={200}
                placeholder="Nom de la page ou lien complet"
                defaultValue={text("facebook", restaurant?.facebook)}
                error={errors.facebook}
              />
            </FormGrid>
          </FormSection>

          <FormSection id="horaires" title="Horaires" description="Un texte court, une ligne par période si besoin.">
            <TextareaField
              name="openingHours"
              label="Horaires d'ouverture"
              rows={3}
              maxLength={300}
              placeholder={"Mar – Dim · 12h – 15h et 19h – 22h30\nFermé le lundi"}
              defaultValue={text("openingHours", restaurant?.openingHours)}
              error={errors.openingHours}
            />
          </FormSection>

          <FormSection
            id="garantie"
            title="Garantie & pratiques"
            description="Ce que le restaurant garantit aux personnes cœliaques, et comment il évite le gluten en cuisine."
          >
            <div className="space-y-5">
              <GuaranteeLevelField
                defaultValue={text("guaranteeLevel", restaurant?.guaranteeLevel)}
                error={errors.guaranteeLevel}
              />
              <div className="grid gap-3 md:grid-cols-3">
                <SwitchField
                  name="dedicatedKitchen"
                  label="Cuisine séparée"
                  description="Cuisine ou plan de travail réservé au sans gluten."
                  defaultChecked={checked("dedicatedKitchen", restaurant?.dedicatedKitchen ?? false)}
                />
                <SwitchField
                  name="dedicatedUtensils"
                  label="Ustensiles dédiés"
                  description="Poêles, planches, friteuse… réservés au sans gluten."
                  defaultChecked={checked("dedicatedUtensils", restaurant?.dedicatedUtensils ?? false)}
                />
                <SwitchField
                  name="trainedStaff"
                  label="Personnel formé"
                  description="L'équipe connaît les règles du sans gluten."
                  defaultChecked={checked("trainedStaff", restaurant?.trainedStaff ?? false)}
                />
              </div>
            </div>
          </FormSection>

          <FormSection
            id="convention"
            title="Convention & livraison"
            description="Un restaurant conventionné reçoit des commandes en ligne, livrées dans son gouvernorat."
          >
            <div className="space-y-5">
              <FormGrid>
                <SwitchField
                  name="isPartner"
                  label="Restaurant conventionné"
                  description="Les visiteurs peuvent commander ses plats en ligne."
                  defaultChecked={isPartner}
                  onChange={(event) => setIsPartner(event.currentTarget.checked)}
                  error={errors.isPartner}
                />
                <DateField
                  name="partnerSince"
                  label="Conventionné depuis le"
                  max={today}
                  hint="Laissez vide : la date du jour est utilisée."
                  defaultValue={state.values?.partnerSince}
                  defaultDate={restaurant?.partnerSince}
                  error={errors.partnerSince}
                />
              </FormGrid>
              <div
                className={cn(
                  "rounded-2xl border border-line bg-canvas/50 p-4 transition-opacity",
                  !isPartner && "opacity-60",
                )}
              >
                {!isPartner ? (
                  <p className="mb-4 text-xs text-ink-subtle">
                    Utilisé seulement si le restaurant est conventionné (commande en ligne).
                  </p>
                ) : null}
                <FormGrid columns={3}>
                  <MoneyField
                    name="deliveryFee"
                    label="Frais de livraison"
                    required={isPartner}
                    hint="0 = livraison gratuite."
                    defaultMillimes={restaurant?.deliveryFee ?? NEW_RESTAURANT_DEFAULTS.deliveryFee}
                    defaultValue={state.values?.deliveryFee}
                    error={errors.deliveryFee}
                  />
                  <TextField
                    name="deliveryTime"
                    label="Délai de livraison"
                    required={isPartner}
                    maxLength={40}
                    placeholder={DEFAULT_DELIVERY_TIME}
                    defaultValue={text("deliveryTime", restaurant?.deliveryTime ?? NEW_RESTAURANT_DEFAULTS.deliveryTime)}
                    error={errors.deliveryTime}
                  />
                  <MoneyField
                    name="minOrder"
                    label="Commande minimum"
                    hint="0 = pas de minimum."
                    defaultMillimes={restaurant?.minOrder ?? NEW_RESTAURANT_DEFAULTS.minOrder}
                    defaultValue={state.values?.minOrder}
                    error={errors.minOrder}
                  />
                </FormGrid>
              </div>
              <EnumSelectField
                name="priceRange"
                label="Gamme de prix"
                required
                options={PRICE_RANGE_OPTIONS}
                defaultValue={text("priceRange", restaurant?.priceRange ?? NEW_RESTAURANT_DEFAULTS.priceRange)}
                error={errors.priceRange}
                wrapperClassName="sm:max-w-xs"
              />
            </div>
          </FormSection>
        </div>

        {/* ---------------- Side column ---------------- */}
        <div className="min-w-0 space-y-6">
          <FormSection id="publication" title="Publication">
            <SwitchField
              name="isActive"
              label="Visible sur le site"
              description="Décochez pour masquer la fiche sans la supprimer."
              defaultChecked={checked("isActive", restaurant?.isActive ?? true)}
            />
          </FormSection>

          <FormSection id="photo" title="Photo" description="La salle, la devanture ou un plat emblématique.">
            <div className="space-y-4">
              {cloudinaryReady ? null : (
                <Alert tone="warning">
                  Cloudinary n&apos;est pas configuré : ajoutez les clés CLOUDINARY_* dans .env pour envoyer des photos. Le reste
                  de la fiche est enregistré normalement.
                </Alert>
              )}
              <ImageUploadField
                key={photoKey}
                label="Photo du restaurant"
                currentUrl={restaurant?.imageUrl}
                alt={restaurant ? `Photo de ${restaurant.name}` : "Photo du restaurant"}
                fallbackIcon="chef"
                hint="JPG, PNG, WEBP ou AVIF · 5 Mo maximum. Format paysage conseillé."
                error={errors.image}
              />
              {photoNotSaved ? (
                <p className="text-xs font-medium text-amber-800">
                  La photo choisie n&apos;a pas été enregistrée : sélectionnez-la à nouveau avant d&apos;enregistrer.
                </p>
              ) : null}
            </div>
          </FormSection>

          <FormSection
            id="verification"
            title="Vérification"
            description="Obligatoire : chaque fiche indique comment et quand ses informations ont été vérifiées."
          >
            <div className="space-y-5">
              <TextField
                name="verificationSource"
                label="Source de vérification"
                required
                maxLength={200}
                placeholder="Visite sur place, appel au gérant…"
                defaultValue={text("verificationSource", restaurant?.verificationSource)}
                error={errors.verificationSource}
              />
              <DateField
                name="verifiedAt"
                label="Date de vérification"
                required
                max={today}
                hint="Une fiche vérifiée il y a plus de 12 mois est signalée « à revérifier »."
                defaultValue={state.values?.verifiedAt}
                defaultDate={restaurant?.verifiedAt ?? today}
                error={errors.verifiedAt}
              />
            </div>
          </FormSection>
        </div>
      </div>

      <FormActions
        cancelHref="/admin/restaurants"
        submitLabel={isNew ? "Créer le restaurant" : "Enregistrer les modifications"}
        pendingLabel={isNew ? "Création…" : "Enregistrement…"}
      >
        {state.status === "error" ? (
          <p className="text-sm font-medium text-red-600">Vérifiez les champs signalés en rouge.</p>
        ) : null}
      </FormActions>
    </form>
  );
}

/** The 3 guarantee levels as radio cards, with what each one means. */
function GuaranteeLevelField({ defaultValue, error }: { defaultValue: string; error?: string[] }) {
  const message = error?.[0];
  return (
    <fieldset aria-describedby={message ? "guaranteeLevel-error" : undefined}>
      <legend className="text-sm font-semibold text-ink">
        Niveau de garantie
        <span className="ms-0.5 text-red-600" aria-hidden="true">
          *
        </span>
      </legend>
      <div className="mt-2 grid gap-3 md:grid-cols-3">
        {GUARANTEE_LEVELS.map((level: GuaranteeLevel) => (
          <label
            key={level}
            className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line bg-white p-3.5 transition-colors hover:border-brand-200 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50/60 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-brand-100"
          >
            <input
              type="radio"
              name="guaranteeLevel"
              value={level}
              required
              defaultChecked={defaultValue === level}
              className="mt-0.5 size-4 shrink-0 accent-brand-600"
            />
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-ink">{GUARANTEE_LABELS[level].label}</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-ink-subtle">{GUARANTEE_LABELS[level].description}</span>
            </span>
          </label>
        ))}
      </div>
      {message ? (
        <p id="guaranteeLevel-error" className="mt-1.5 text-xs font-medium text-red-600" role="alert">
          {message}
        </p>
      ) : null}
    </fieldset>
  );
}
