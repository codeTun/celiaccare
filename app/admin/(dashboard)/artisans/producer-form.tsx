"use client";

import { FormGrid } from "@/components/admin/admin-form";
import { CatalogForm, type CatalogFormAction } from "@/components/admin/catalog/catalog-form";
import { CoordinatesFields } from "@/components/admin/catalog/coordinates-fields";
import { ArabicSection, FormColumns, PhotoSection, VerificationSection } from "@/components/admin/catalog/form-sections";
import { checkedValue, textValue } from "@/components/admin/catalog/form-values";
import { GuaranteeLevelField } from "@/components/admin/catalog/guarantee";
import { PRODUCER_TYPE_ICON_KEYS, PRODUCER_TYPE_LABELS } from "@/components/admin/catalog/labels";
import { FormSection } from "@/components/admin/form-section";
import { EnumSelectField, GovernorateSelectField } from "@/components/admin/select-fields";
import { SwitchField } from "@/components/admin/switch-field";
import { TextareaField, TextField } from "@/components/ui/form";
import type { ActionState } from "@/lib/validators";
import type { AdminProducerForm } from "@/types/admin-data";

type ProducerFormProps = {
  /** createProducerAction, or updateProducerAction.bind(null, id) (bound in the Server Component). */
  action: CatalogFormAction;
  /** The saved artisan (edit page) — undefined on the create page. */
  producer?: AdminProducerForm;
  /** Today in Tunis ("YYYY-MM-DD"): default and latest verification date. */
  today: string;
  cloudinaryReady: boolean;
  submitLabel: string;
};

/** Create / edit form of an artisan (spec 5.2 "fiche adresse"). */
export function ProducerForm({ action, submitLabel, ...props }: ProducerFormProps) {
  return (
    <CatalogForm action={action} cancelHref="/admin/artisans" submitLabel={submitLabel}>
      {(state) => <ProducerFields state={state} {...props} />}
    </CatalogForm>
  );
}

function ProducerFields({
  state,
  producer,
  today,
  cloudinaryReady,
}: Omit<ProducerFormProps, "action" | "submitLabel"> & { state: ActionState }) {
  const values = state.values;
  const errors = state.fieldErrors;
  const text = (name: keyof AdminProducerForm) => {
    const saved = producer?.[name];
    return textValue(values, name, typeof saved === "boolean" ? null : saved);
  };
  const checked = (name: "dedicatedSpace" | "dedicatedUtensils" | "trainedStaff" | "isActive", fallback: boolean) =>
    checkedValue(values, name, producer ? producer[name] : fallback);
  const type = producer?.type ?? "BAKERY";

  return (
    <FormColumns
      main={
        <>
          <FormSection title="Identité" description="Qui est l'artisan, tel que présenté sur sa fiche.">
            <FormGrid>
              <TextField
                name="name"
                label="Nom"
                required
                maxLength={120}
                placeholder="Dar Jasmin"
                defaultValue={text("name")}
                error={errors?.name}
                wrapperClassName="sm:col-span-2"
              />
              <EnumSelectField
                name="type"
                label="Type d'artisan"
                required
                options={PRODUCER_TYPE_LABELS}
                placeholder="Choisir…"
                defaultValue={text("type")}
                error={errors?.type}
              />
              <TextField
                name="slug"
                label="Adresse de la fiche (slug)"
                maxLength={80}
                autoComplete="off"
                placeholder="dar-jasmin-sousse"
                hint="Laissez vide : elle est créée à partir du nom."
                defaultValue={text("slug")}
                error={errors?.slug}
                className="font-mono text-sm"
              />
              <TextareaField
                name="description"
                label="Présentation"
                rows={5}
                maxLength={2000}
                hint="Ce qu'il fabrique ou vend, son histoire, ses spécialités sans gluten."
                defaultValue={text("description")}
                error={errors?.description}
                wrapperClassName="sm:col-span-2"
              />
            </FormGrid>
          </FormSection>

          <FormSection title="Adresse" description="Où trouver l'artisan (affiché sur la fiche et la carte).">
            <FormGrid>
              <GovernorateSelectField
                name="governorate"
                label="Gouvernorat"
                required
                defaultValue={text("governorate")}
                error={errors?.governorate}
              />
              <TextField
                name="city"
                label="Ville"
                required
                maxLength={80}
                placeholder="Sousse"
                defaultValue={text("city")}
                error={errors?.city}
              />
              <TextField
                name="address"
                label="Adresse"
                maxLength={200}
                placeholder="12 rue de la Kasbah, Médina"
                defaultValue={text("address")}
                error={errors?.address}
                wrapperClassName="sm:col-span-2"
              />
              <CoordinatesFields
                latitude={text("latitude")}
                longitude={text("longitude")}
                errors={{ latitude: errors?.latitude, longitude: errors?.longitude }}
              />
            </FormGrid>
          </FormSection>

          <FormSection title="Contacts" description="Tous facultatifs : seuls les contacts renseignés sont affichés.">
            <FormGrid>
              <TextField
                name="phone"
                label="Téléphone"
                type="tel"
                inputMode="tel"
                autoComplete="off"
                placeholder="20 123 456"
                hint="Numéro tunisien à 8 chiffres."
                defaultValue={text("phone")}
                error={errors?.phone}
              />
              <TextField
                name="whatsapp"
                label="WhatsApp"
                type="tel"
                inputMode="tel"
                autoComplete="off"
                placeholder="20 123 456"
                hint="Pour le bouton « Écrire sur WhatsApp »."
                defaultValue={text("whatsapp")}
                error={errors?.whatsapp}
              />
              <TextField
                name="email"
                label="E-mail"
                type="email"
                autoComplete="off"
                placeholder="contact@exemple.tn"
                defaultValue={text("email")}
                error={errors?.email}
              />
              <TextField
                name="website"
                label="Site web"
                type="text"
                inputMode="url"
                autoComplete="off"
                placeholder="https://exemple.tn"
                dir="ltr"
                defaultValue={text("website")}
                error={errors?.website}
              />
              <TextField
                name="instagram"
                label="Instagram"
                autoComplete="off"
                placeholder="@compte ou lien"
                dir="ltr"
                defaultValue={text("instagram")}
                error={errors?.instagram}
              />
              <TextField
                name="facebook"
                label="Facebook"
                autoComplete="off"
                placeholder="page ou lien"
                dir="ltr"
                defaultValue={text("facebook")}
                error={errors?.facebook}
              />
            </FormGrid>
          </FormSection>

          <FormSection title="Horaires" description="Jours et heures d'ouverture, comme vous voulez les afficher.">
            <TextareaField
              name="openingHours"
              label="Horaires d'ouverture"
              rows={3}
              maxLength={500}
              placeholder={"Lun – Sam · 8h – 19h\nDimanche : fermé"}
              defaultValue={text("openingHours")}
              error={errors?.openingHours}
            />
          </FormSection>

          <FormSection
            title="Garantie & pratiques"
            description="Le niveau de garantie est affiché sur la fiche et ses produits. En cas de doute, choisissez le niveau le plus prudent."
          >
            <div className="space-y-5">
              <GuaranteeLevelField defaultValue={text("guaranteeLevel")} error={errors?.guaranteeLevel} />
              <div className="grid gap-3 lg:grid-cols-3">
                <SwitchField
                  name="dedicatedSpace"
                  label="Atelier séparé"
                  description="Un espace réservé au sans gluten."
                  defaultChecked={checked("dedicatedSpace", false)}
                />
                <SwitchField
                  name="dedicatedUtensils"
                  label="Ustensiles dédiés"
                  description="Ustensiles et plans de travail réservés."
                  defaultChecked={checked("dedicatedUtensils", false)}
                />
                <SwitchField
                  name="trainedStaff"
                  label="Personnel formé"
                  description="Formé à la maladie cœliaque et aux contaminations."
                  defaultChecked={checked("trainedStaff", false)}
                />
              </div>
            </div>
          </FormSection>

          <ArabicSection>
            <TextareaField
              name="descriptionAr"
              label="Présentation en arabe"
              dir="rtl"
              lang="ar"
              rows={5}
              maxLength={2000}
              defaultValue={text("descriptionAr")}
              error={errors?.descriptionAr}
            />
          </ArabicSection>
        </>
      }
      side={
        <>
          <FormSection title="Publication">
            <SwitchField
              name="isActive"
              label="Visible sur le site"
              description="Décochez pour masquer la fiche et ses produits sans rien supprimer."
              defaultChecked={checked("isActive", true)}
            />
          </FormSection>
          <VerificationSection
            source={{ value: text("verificationSource"), error: errors?.verificationSource }}
            date={textValue(values, "verifiedAt", producer?.verifiedAt ?? today)}
            dateError={errors?.verifiedAt}
            today={today}
          />
          <PhotoSection
            cloudinaryReady={cloudinaryReady}
            label="Photo de la boutique ou de l'atelier"
            description="Une photo réelle inspire confiance (devanture, atelier, produits)."
            currentUrl={producer?.imageUrl}
            alt={producer ? `Photo de ${producer.name}` : "Photo de l'artisan"}
            fallbackIcon={PRODUCER_TYPE_ICON_KEYS[type]}
            error={errors?.image}
          />
        </>
      }
    />
  );
}
