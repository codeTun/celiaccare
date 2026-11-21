import type { GuaranteeLevel, ProducerType } from "@/types";

/* ==========================================================================
   French texts of the catalogue values, for the admin panel (French only).
   The public website has its own translated texts in i18n/resources.
   ========================================================================== */

/** Kinds of small businesses (Producer.type). */
export const PRODUCER_TYPE_LABELS: Record<ProducerType, string> = {
  BAKERY: "Pâtisserie & boulangerie",
  SPECIALTY_SHOP: "Boutique spécialisée",
  GROCERY: "Épicerie de quartier",
  HOME_SELLER: "Fait maison (à domicile)",
  COOPERATIVE: "Coopérative",
  MANUFACTURER: "Fabricant sans gluten (petite marque)",
};

/** Category icon (lib/icons.ts key) shown in place of the photo of an artisan who has none. */
export const PRODUCER_TYPE_ICON_KEYS: Record<ProducerType, string> = {
  BAKERY: "bread",
  SPECIALTY_SHOP: "pantry",
  GROCERY: "pantry",
  HOME_SELLER: "chef",
  COOPERATIVE: "leaf",
  MANUFACTURER: "package",
};

/**
 * The gluten-free guarantee levels (spec 5.2), explained for the admin.
 * Policy "100 % sans gluten only": only CERTIFIED and DEDICATED can be chosen in the forms
 * (LISTED_GUARANTEE_LEVELS); the two older levels stay here to display older sheets.
 */
export const GUARANTEE_LEVEL_INFO: Record<GuaranteeLevel, { label: string; short: string; description: string }> = {
  CERTIFIED: {
    label: "Certifié sans gluten",
    short: "Certifié",
    description: "Certification officielle vérifiée : logo, organisme et numéro (ex. INNORPI, AFDIAG).",
  },
  DEDICATED: {
    label: "100\u00a0% sans gluten",
    short: "100\u00a0% sans gluten",
    description:
      "Commerce ou atelier qui ne travaille que sans gluten (ou unité de production entièrement séparée). Vérifié sur sources publiques ; pas de certificat officiel.",
  },
  NATURALLY_GF: {
    label: "Naturellement sans gluten (ancien niveau)",
    short: "Sans gluten",
    description:
      "Ancien niveau, n'est plus proposé : recette naturellement sans gluten ou option préparée avec précautions, sans certification officielle.",
  },
  TRACES_RISK: {
    label: "Risque de traces (ancien niveau)",
    short: "Traces possibles",
    description:
      "Ancien niveau, n'est plus proposé : aucun ingrédient à gluten, mais une contamination croisée est possible.",
  },
};

/** Suggestions offered by the "Source de vérification" field (any other text is accepted). */
export const VERIFICATION_SOURCES = [
  "Visite sur place",
  "Appel téléphonique",
  "Échange WhatsApp",
  "Étiquette du produit",
  "Certificat fourni par l'artisan",
  "Site officiel / réseaux sociaux",
  "Sources publiques (site, réseaux sociaux, presse)",
];

/** ?ok= code used when a sheet was saved but its new photo was not sent (Cloudinary not configured). */
export const PHOTO_SKIPPED_CODE = "saved-no-photo";

/** Flash message of PHOTO_SKIPPED_CODE (add it to the `messages` of <FlashMessage>). */
export const PHOTO_SKIPPED_MESSAGE =
  "La fiche est enregistrée, mais sans la nouvelle photo : Cloudinary n'est pas configuré (clés CLOUDINARY_* dans .env).";

/** Flash message of PHOTO_SKIPPED_CODE for the sheets that have a photo AND a logo (artisans). */
export const IMAGE_SKIPPED_MESSAGE =
  "La fiche est enregistrée, mais sans la nouvelle image choisie (photo ou logo) : Cloudinary n'est pas configuré (clés CLOUDINARY_* dans .env).";

/** "Logo" card of the artisan and restaurant forms: where the logo is shown, and the rules. */
export const LOGO_SECTION_DESCRIPTION =
  "Affiché dans le bandeau des marques, en bas de la page d'accueil. Sans logo, un monogramme aux couleurs du site le remplace.";
export const LOGO_HINT =
  "Logo officiel, uniquement avec l'accord du commerce. PNG ou WebP à fond transparent, de préférence carré.";

/** Text shown in the photo section of the forms when Cloudinary is not configured. */
export const CLOUDINARY_MISSING_MESSAGE =
  "Cloudinary n'est pas configuré : ajoutez les clés CLOUDINARY_* dans .env pour envoyer des photos. Le reste de la fiche est enregistré normalement.";

/** Path of a sheet on the public website (French version), e.g. publicPath("produits", "pain-de-mie"). */
export function publicPath(section: "produits" | "artisans", slug: string) {
  return `/fr/${section}/${encodeURIComponent(slug)}`;
}

/** "« Pain de mie » (pain-de-mie)": short description of a sheet for the audit log. */
export function auditLabel(name: string, slug?: string | null) {
  return slug ? `« ${name} » (${slug})` : `« ${name} »`;
}
