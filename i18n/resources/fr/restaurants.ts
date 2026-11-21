/**
 * Texts of the restaurants directory (/restaurants) and of the restaurant pages
 * (/restaurants/[slug]) — French. The Arabic file must have exactly the same keys.
 * Placeholders like {name} are filled with interpolate() from "@/i18n/interpolate".
 */
export const restaurants = {
  meta: {
    title: "Restaurants sans gluten en Tunisie",
    description:
      "Restaurants et cafés sans gluten vérifiés en Tunisie : niveau de garantie, pratiques en cuisine, horaires et commande en ligne chez nos partenaires.",
    detailTitle: "{name} : plats sans gluten à {city}",
    detailDescription:
      "{name} à {city} : plats sans gluten, niveau de garantie, pratiques en cuisine et horaires. Commande via CeliacCare.",
    detailDescriptionPartner:
      "{name} à {city} : commandez vos plats sans gluten sur CeliacCare, livrés chez vous. Niveau de garantie, pratiques en cuisine et horaires.",
  },

  hero: {
    eyebrow: "Restaurants & cafés",
    title: "Restaurants sans gluten",
    description:
      "Des adresses vérifiées une à une : niveau de garantie, pratiques en cuisine et horaires. Chez nos restaurants partenaires, commandez sur CeliacCare et faites-vous livrer.",
    highlights: ["Commande en ligne chez nos partenaires", "Livraison gratuite à domicile", "Paiement à la livraison"],
  },

  filters: {
    label: "Filtrer les restaurants",
    search: "Rechercher un restaurant",
    searchPlaceholder: "Nom, ville, cuisine…",
    governorate: "Gouvernorat",
    guarantee: "Niveau de garantie",
    allGuarantees: "Tous les niveaux",
    guaranteeHint: "Tous les commerces référencés sont 100\u00a0% sans gluten.",
    partnersOnly: "Partenaires seulement",
    partnersOnlyHint: "Commande en ligne",
    submit: "Filtrer",
    reset: "Effacer les filtres",
  },

  results: {
    countOne: "{count} restaurant",
    countOther: "{count} restaurants",
    emptyTitle: "Aucun restaurant pour le moment",
    emptyText:
      "Nous vérifions nos premières adresses une à une. Vous connaissez un restaurant qui propose du sans gluten ? Dites-le-nous.",
    noMatchTitle: "Aucun restaurant ne correspond à votre recherche",
    noMatchText: "Essayez d'autres mots-clés ou retirez un filtre.",
    notCoveredTitle: "Pas encore de restaurant vérifié dans le gouvernorat de {governorate}",
    notCoveredText:
      "Notre annuaire ne couvre pas encore ce gouvernorat. Vous connaissez un restaurant qui propose du sans gluten ? Proposez-le : notre équipe le vérifiera.",
    suggest: "Proposer une adresse",
    seeAll: "Voir tous les restaurants",
    partnersTitle: "Restaurants partenaires",
    partnersText: "Commande en ligne et livraison gratuite à domicile.",
    othersTitle: "Autres adresses vérifiées",
    othersText:
      "Pas encore disponibles à la commande sur CeliacCare : demandez-les depuis leur page, nous contactons le restaurant pour vous.",
  },

  howTo: {
    eyebrow: "Restaurants conventionnés",
    title: "Commander chez un restaurant partenaire",
    text: "Nos partenaires ont signé une convention avec CeliacCare : leur carte sans gluten est vérifiée et vous commandez directement sur le site.",
    steps: [
      {
        title: "Choisissez un partenaire",
        text: "Repérez le badge « Partenaire » et ouvrez sa carte sans gluten.",
      },
      {
        title: "Composez votre panier",
        text: "Ajoutez vos plats : un panier contient les plats d'un seul restaurant.",
      },
      {
        title: "Recevez votre commande",
        text: "Livraison gratuite à domicile et paiement à la livraison, en espèces ou par carte.",
      },
    ],
    cta: "Voir les restaurants partenaires",
  },

  join: {
    title: "Vous tenez un restaurant sans gluten ?",
    text: "Rejoignez nos restaurants partenaires : une fiche vérifiée, de la visibilité auprès de la communauté et des commandes en ligne.",
    cta: "Devenir partenaire",
    suggest: "Proposer une adresse",
  },

  page: {
    seeMenu: "Voir la carte",
    seeReviews: "Voir les avis",
  },

  delivery: {
    title: "Livraison & paiement",
    text: "Ce restaurant partenaire livre à domicile, gratuitement. Vérifiez ces informations avant de commander.",
    zone: "Zone desservie",
    zoneValue: "Gouvernorat de {governorate}",
    payment: "Paiement",
    paymentValue: "À la livraison : espèces ou carte",
  },

  menu: {
    title: "La carte sans gluten",
    intro: "Les plats sans gluten de ce restaurant. Les ingrédients allergènes sont surlignés.",
    orderHint: "Ajoutez vos plats au panier, puis validez votre commande.",
    sectionsLabel: "Rubriques de la carte",
    ingredients: "Ingrédients :",
    allergen: "allergène",
    add: "Ajouter",
    unavailable: "Indisponible aujourd'hui",
    /** Above the "Demander sur CeliacCare" box when no dish is online yet */
    emptyText: "Ses plats sans gluten et leurs prix ne sont pas encore publiés sur CeliacCare.",
  },

  cart: {
    title: "Votre commande",
    view: "Voir mon panier",
    itemsOne: "{count} article",
    itemsOther: "{count} articles",
  },

  /** Shared "fiche adresse" blocks (components/directory). Same keys in producers.sheet. */
  sheet: {
    title: "Fiche adresse",
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
  },
};

export type RestaurantsDict = typeof restaurants;
