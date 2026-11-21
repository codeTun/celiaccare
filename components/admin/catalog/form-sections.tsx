import type { ReactNode } from "react";

import { DateField } from "@/components/admin/date-field";
import { FormSection } from "@/components/admin/form-section";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Alert } from "@/components/ui/alert";
import { TextField } from "@/components/ui/form";

import { CLOUDINARY_MISSING_MESSAGE, LOGO_HINT, LOGO_SECTION_DESCRIPTION, VERIFICATION_SOURCES } from "./labels";

/* ==========================================================================
   Sections shared by the catalogue forms (categories, artisans, products).
   Plain components: they are used inside the Client Component forms.
   ========================================================================== */

/**
 * Two-column layout of a long form: the content on the start side, the
 * publication / photo / verification cards on the end side (one column on phones).
 */
export function FormColumns({ main, side }: { main: ReactNode; side: ReactNode }) {
  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(19rem,23rem)]">
      <div className="min-w-0 space-y-6">{main}</div>
      <div className="min-w-0 space-y-6">{side}</div>
    </div>
  );
}

/** "Version arabe (facultatif)": wrap the nameAr / descriptionAr fields (inputs with dir="rtl" lang="ar"). */
export function ArabicSection({ children }: { children: ReactNode }) {
  return (
    <FormSection
      title="Version arabe (facultatif)"
      description="Affichée sur la version arabe du site. Un champ laissé vide reprend le texte français."
    >
      {children}
    </FormSection>
  );
}

/**
 * "Photo" card: the upload field (sends "image" and "removeImage"), with a warning when
 * Cloudinary is not configured (the rest of the sheet is still saved).
 */
export function PhotoSection({
  cloudinaryReady,
  label,
  description,
  currentUrl,
  alt,
  fallbackIcon,
  error,
}: {
  cloudinaryReady: boolean;
  label: string;
  description?: string;
  currentUrl?: string | null;
  alt: string;
  fallbackIcon?: string | null;
  error?: string[];
}) {
  return (
    <FormSection title="Photo" description={description}>
      {cloudinaryReady ? null : (
        <Alert tone="warning" className="mb-4">
          {CLOUDINARY_MISSING_MESSAGE}
        </Alert>
      )}
      <ImageUploadField label={label} currentUrl={currentUrl} alt={alt} fallbackIcon={fallbackIcon} error={error} />
    </FormSection>
  );
}

/**
 * "Logo" card of the artisan and restaurant forms: the official logo shown in the brand band of
 * the home page (sends "logo" and "removeLogo"). Uploaded only with the business's agreement;
 * without it the site draws a monogram. Same Cloudinary warning and behaviour as PhotoSection.
 */
export function LogoSection({
  cloudinaryReady,
  currentUrl,
  alt,
  fallbackIcon,
  error,
  notice,
}: {
  cloudinaryReady: boolean;
  currentUrl?: string | null;
  alt: string;
  fallbackIcon?: string | null;
  error?: string[];
  /** Extra line under the field, e.g. "the chosen logo was not saved" (restaurant form). */
  notice?: ReactNode;
}) {
  return (
    <FormSection id="logo" title="Logo" description={LOGO_SECTION_DESCRIPTION}>
      {cloudinaryReady ? null : (
        <Alert tone="warning" className="mb-4">
          {CLOUDINARY_MISSING_MESSAGE}
        </Alert>
      )}
      <ImageUploadField
        kind="logo"
        name="logo"
        removeName="removeLogo"
        label="Logo officiel"
        hint={LOGO_HINT}
        currentUrl={currentUrl}
        alt={alt}
        fallbackIcon={fallbackIcon}
        error={error}
      />
      {notice}
    </FormSection>
  );
}

/**
 * "Vérification" card (spec 6.1: no sheet without a source and a date; after 12 months
 * the sheet is flagged "À revérifier"). Artisans have their own source field; products
 * show the source of their artisan (`inheritedSource`).
 */
export function VerificationSection({
  source,
  inheritedSource,
  date,
  dateError,
  today,
}: {
  /** Editable source (artisans): value to show and its error. */
  source?: { value: string; error?: string[] };
  /** Read-only explanation shown instead of the source field (products). */
  inheritedSource?: ReactNode;
  /** "YYYY-MM-DD" */
  date: string;
  dateError?: string[];
  /** Today in Tunis, "YYYY-MM-DD": the latest date allowed. */
  today: string;
}) {
  return (
    <FormSection
      title="Vérification"
      description="Aucune fiche n'est publiée sans source ni date. Après 12 mois, elle est signalée « À revérifier »."
    >
      <div className="space-y-5">
        {source ? (
          <>
            <TextField
              name="verificationSource"
              label="Source de vérification"
              required
              maxLength={200}
              list="verification-source-suggestions"
              autoComplete="off"
              placeholder="Visite sur place"
              hint="Comment l'information a été vérifiée (choisissez une suggestion ou écrivez la vôtre)."
              defaultValue={source.value}
              error={source.error}
            />
            <datalist id="verification-source-suggestions">
              {VERIFICATION_SOURCES.map((suggestion) => (
                <option key={suggestion} value={suggestion} />
              ))}
            </datalist>
          </>
        ) : (
          inheritedSource
        )}
        <DateField
          name="verifiedAt"
          label="Date de vérification"
          required
          max={today}
          defaultValue={date}
          error={dateError}
          hint="Le jour où les informations ont été contrôlées."
        />
      </div>
    </FormSection>
  );
}
