import type { RestaurantsDict } from "./restaurants";

/**
 * Texts of the artisans directory (/artisans) and of the artisan pages
 * (/artisans/[slug]) — French. The Arabic file must have exactly the same keys.
 * Placeholders like {name} are filled with interpolate() from "@/i18n/interpolate".
 */
export const producers = {
  meta: {
    title: "Artisans et petits producteurs sans gluten en Tunisie",
    description:
      "Les artisans sans gluten de Tunisie, vérifiés un à un : pâtisseries, boulangeries, épiceries, boutiques spécialisées, cuisine maison et coopératives.",
    detailTitle: "{name} : produits sans gluten à {city}",
    detailDescription:
      "{name} ({type}, {city}) : produits sans gluten, niveau de garantie, pratiques de fabrication, horaires et contact.",
  },

  hero: {
    eyebrow: "Artisans & petits producteurs",
    title: "Les artisans du sans gluten",
    description:
      "CeliacCare travaille uniquement avec de petits producteurs tunisiens : pâtisseries de quartier, épiceries, cuisine maison, coopératives… jamais avec de grandes marques. Chaque fiche est vérifiée et datée.",
    highlights: ["Petits producteurs locaux", "Jamais de grandes marques", "Fiches vérifiées et datées"],
  },

  types: {
    label: "Type de commerce",
    all: "Tous",
  },

  filters: {
    label: "Filtrer les artisans",
    search: "Rechercher un artisan",
    searchPlaceholder: "Nom, ville, spécialité…",
    governorate: "Gouvernorat",
    guarantee: "Niveau de garantie",
    allGuarantees: "Tous les niveaux",
    submit: "Filtrer",
    reset: "Effacer les filtres",
  },

  results: {
    /** Heading of the results (read by screen readers only) */
    title: "Liste des artisans",
    countOne: "{count} artisan",
    countOther: "{count} artisans",
    productsOne: "{count} produit",
    productsOther: "{count} produits",
    emptyTitle: "Aucun artisan pour le moment",
    emptyText:
      "Nous vérifions nos premiers artisans un à un. Vous connaissez une pâtisserie, une épicerie ou une cuisinière qui fait du sans gluten ? Dites-le-nous.",
    noMatchTitle: "Aucun artisan ne correspond à votre recherche",
    noMatchText: "Essayez d'autres mots-clés ou retirez un filtre.",
    notCoveredTitle: "Pas encore d'artisan vérifié dans le gouvernorat de {governorate}",
    notCoveredText:
      "Notre annuaire ne couvre pas encore ce gouvernorat. Vous connaissez un artisan qui fait du sans gluten ? Proposez-le : notre équipe le vérifiera.",
    suggest: "Proposer une adresse",
    seeAll: "Voir tous les artisans",
  },

  join: {
    title: "Vous êtes artisan ou petit producteur ?",
    text: "Pâtisserie, épicerie, cuisine maison ou coopérative : rejoignez CeliacCare et proposez vos produits sans gluten partout en Tunisie.",
    cta: "Rejoindre CeliacCare",
    suggest: "Proposer une adresse",
  },

  page: {
    story: "L'histoire de {name}",
    seeProducts: "Voir les produits",
    productsTitle: "Les produits de {name}",
    productsText: "Commandez en ligne : nous livrons à domicile.",
    productsEmptyTitle: "Pas encore de produit en ligne",
    productsEmptyText: "Contactez directement l'artisan pour connaître ses produits sans gluten du moment.",
  },

  /** Shared "fiche adresse" blocks (components/directory): same keys as restaurants.sheet. */
  sheet: {
    title: "Fiche artisan",
    links: "Sur le web",
    instagram: "Instagram",
    facebook: "Facebook",
    networkOf: "{network} de {name}",
    yes: "oui",
    notDeclared: "non déclaré",
    reportTitle: "Une information a changé ?",
    reportText: "Aidez la communauté : signalez-nous toute erreur sur cette fiche, nous la corrigeons rapidement.",
    map: {
      title: "Localisation",
      frameTitle: "Carte : localisation de {name}",
      enlarge: "Agrandir la carte",
      noPosition: "Position exacte non renseignée",
      noPositionText: "Utilisez l'itinéraire pour trouver l'adresse.",
    },
  } satisfies RestaurantsDict["sheet"],
};

export type ProducersDict = typeof producers;
