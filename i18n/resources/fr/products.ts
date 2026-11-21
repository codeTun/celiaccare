/**
 * Texts of the product catalogue (/produits) and of the product sheet (/produits/[slug]) — French.
 * Sentences with "{name}" are filled with interpolate(); plural sentences have one form per
 * plural category (French only uses "zero", "one" and "other", Arabic uses all of them).
 */
export const products = {
  meta: {
    title: "Produits sans gluten d'artisans tunisiens",
    description:
      "Produits sans gluten d'artisans tunisiens : pains, couscous, pâtisseries, farines. Ingrédients et allergènes vérifiés, livraison à domicile en Tunisie.",
    /** Title of a product page, when the name does not already say "sans gluten" */
    detailTitle: "{name} sans gluten",
  },

  hero: {
    eyebrow: "Catalogue",
    title: "Produits sans gluten",
    description:
      "Des produits faits par de petits artisans tunisiens, jamais par de grandes marques. Chaque fiche indique les ingrédients, les allergènes et un niveau de garantie vérifié par notre équipe.",
    legendLabel: "Nos niveaux de garantie",
    legendLink: "Comprendre les niveaux de garantie",
  },

  catalog: {
    categoriesLabel: "Catégories de produits",
    allProducts: "Tous les produits",
    resultsTitle: "Résultats de la recherche",
    count: {
      zero: "Aucun produit",
      one: "{count} produit",
      two: "{count} produits",
      few: "{count} produits",
      many: "{count} produits",
      other: "{count} produits",
    },
    pageOf: "page {page} sur {count}",
    sortLabel: "Trier par",
    sortSubmit: "Trier",
    sorts: {
      new: "Nouveautés",
      "price-asc": "Prix croissant",
      "price-desc": "Prix décroissant",
      name: "Nom (A → Z)",
      rating: "Les plus populaires",
    },
    noResultsTitle: "Aucun produit ne correspond à votre recherche",
    noResultsText:
      "Essayez d'enlever un filtre ou de chercher un autre mot. Vous connaissez un bon produit sans gluten qui manque ? Dites-le-nous !",
    emptyTitle: "Le catalogue arrive bientôt",
    emptyText:
      "Nos premiers artisans ajoutent leurs produits. Vous connaissez un produit sans gluten fait en Tunisie ? Proposez-le-nous.",
    clearFilters: "Effacer les filtres",
    suggest: "Proposer une adresse ou un produit",
    searchElsewhere: "Vous cherchez un restaurant ou un artisan ?",
    searchRestaurants: "Chercher « {q} » parmi les restaurants",
    searchProducers: "Chercher « {q} » parmi les artisans",
  },

  filters: {
    title: "Filtres",
    button: "Filtres",
    activeCount: "{count} filtre(s) actif(s)",
    close: "Fermer les filtres",
    apply: "Appliquer",
    showResults: "Voir les résultats",
    clearAll: "Tout effacer",
    searchLabel: "Rechercher un produit",
    searchPlaceholder: "Ex. couscous, makroudh…",
    category: "Catégorie",
    allCategories: "Toutes les catégories",
    guarantee: "Niveau de garantie",
    allGuarantees: "Tous les niveaux",
    guaranteeHint: "Tous les commerces référencés sont 100\u00a0% sans gluten.",
    exclude: "Sans ces allergènes",
    excludeHint: "Les produits qui en contiennent sont masqués.",
    contains: "Contient",
    containsHint: "Produits qui contiennent tous les ingrédients cochés.",
    ingredientSearch: "Chercher un ingrédient",
    noIngredientFound: "Aucun ingrédient ne correspond.",
    price: "Prix (DT)",
    priceMin: "Prix minimum, en dinars",
    priceMax: "Prix maximum, en dinars",
    priceFrom: "Min",
    priceTo: "Max",
    activeTitle: "Filtres actifs",
    remove: "Retirer le filtre « {label} »",
    chipSearch: "« {value} »",
    chipContains: "Contient : {name}",
    chipExclude: "Sans {name}",
    chipPriceRange: "{min} – {max} DT",
    chipPriceMin: "Dès {min} DT",
    chipPriceMax: "Jusqu'à {max} DT",
    chipProducer: "Artisan : {name}",
  },

  sheet: {
    unavailable: "Momentanément indisponible",
    unavailableText:
      "Ce produit n'est pas disponible pour le moment. Revenez bientôt, ou demandez-le à CeliacCare : nous contactons l'artisan pour vous.",
    quantity: "Quantité",
    decrease: "Retirer un article",
    increase: "Ajouter un article",
    giveReview: "Donner mon avis",
    guaranteeLink: "Comprendre les niveaux de garantie",
    description: "Description",
    ingredientsTitle: "Ingrédients & allergènes",
    ingredientsEmpty: "Composition détaillée non publiée en ligne : consultez l'étiquette du fabricant.",
    allergenTag: "allergène",
    allergensLine: "Allergènes : {list}.",
    noAllergens: "Aucun allergène majeur déclaré.",
    mayContain: "Peut contenir des traces de : {list}",
    labelWarning: "Vérifiez toujours l'étiquette, les recettes peuvent changer.",
    certificationTitle: "Certification sans gluten",
    verificationTitle: "Fiabilité de la fiche",
    updatedOn: "Mis à jour le {date}",
    reportPrompt: "Une information est fausse ou a changé ? Aidez-nous à garder la fiche à jour.",
    producerTitle: "Fait par",
    producerPage: "Voir la boutique",
    producerProducts: "Tous ses produits",
    deliveryTitle: "Livraison & paiement",
    deliveryZones: {
      zero: "Livraison à domicile bientôt disponible",
      one: "Livraison à domicile dans {count} gouvernorat",
      two: "Livraison à domicile dans {count} gouvernorats",
      few: "Livraison à domicile dans {count} gouvernorats",
      many: "Livraison à domicile dans {count} gouvernorats",
      other: "Livraison à domicile dans {count} gouvernorats",
    },
    deliveryFree: "Livraison gratuite, sans minimum d'achat",
    deliveryZonesToggle: "Voir les zones et les délais",
    deliveryNone: "Les zones de livraison seront bientôt annoncées.",
    payment: "Paiement à la livraison, en espèces ou par carte.",
    relatedEyebrow: "À découvrir aussi",
    relatedTitle: "Dans la même catégorie",
    seeCategory: "Voir la catégorie",
  },
};

export type ProductsDict = typeof products;
