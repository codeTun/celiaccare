/**
 * Texts of the home page (French).
 * The Arabic version (../ar/home.ts) must have exactly the same keys.
 * {count}, {max}... are placeholders filled with interpolate().
 */
export const home = {
  meta: {
    title: "CeliacCare · Produits et restaurants sans gluten en Tunisie",
    description:
      "Produits sans gluten de petits artisans tunisiens et restaurants partenaires vérifiés. Fiches sourcées et datées, commande en ligne, livraison à domicile.",
  },

  hero: {
    welcome: "Marhba ! Le marché sans gluten de Tunisie",
    titleStart: "Le sans gluten en Tunisie,",
    titleHighlight: "en toute confiance",
    text: "Des produits faits par de petits producteurs tunisiens et des plats de restaurants partenaires, avec des fiches vérifiées, sourcées et datées. Vous commandez en ligne, on vous livre à la maison.",
    searchLabel: "Rechercher un produit sans gluten",
    searchPlaceholder: "Couscous, pain, makroudh, bsissa…",
    popularLabel: "Souvent recherchés :",
    popular: ["Couscous", "Pain", "Makroudh", "Bsissa", "Farine"],
    ctaProducts: "Découvrir les produits",
    ctaRestaurants: "Commander au restaurant",
    trustLabel: "Nos engagements",
    trust: {
      verified: "Fiches vérifiées et datées",
      local: "Petits producteurs tunisiens",
      delivery: "Livraison partout en Tunisie",
    },
    // Little cards floating around the doorway illustration
    visual: {
      verifiedTitle: "Fiche vérifiée",
      verifiedText: "Source et date affichées",
      deliveryTitle: "Livré chez vous",
      deliveryText: "Paiement à la livraison",
    },
  },

  // Live numbers (also used by the about page)
  stats: {
    label: "CeliacCare en chiffres",
    products: "Produits sans gluten",
    producers: "Artisans tunisiens",
    partnerRestaurants: "Restaurants partenaires",
    // governorates where we deliver (EF-05: the directory itself does not cover all of them yet)
    governorates: "Gouvernorats livrés",
  },

  categories: {
    eyebrow: "Catalogue",
    title: "Explorer par catégorie",
    description: "Du pain du matin aux douceurs des fêtes : tout le sans gluten de nos artisans, rangé simplement.",
    seeAll: "Tout le catalogue",
    productCount: {
      zero: "Aucun produit",
      one: "{count} produit",
      two: "{count} produits",
      few: "{count} produits",
      many: "{count} produits",
      other: "{count} produits",
    },
  },

  featured: {
    eyebrow: "Sélection",
    title: "Les coups de cœur du moment",
    description: "Des produits sans gluten faits en Tunisie, choisis parmi les fiches de nos artisans.",
    seeAll: "Voir tous les produits",
    emptyTitle: "Les premiers produits arrivent bientôt",
    emptyText:
      "Nos artisans préparent leurs fiches. En attendant, parlez-nous d'un producteur sans gluten que vous aimez.",
    emptyAction: "Proposer un artisan",
  },

  howItWorks: {
    eyebrow: "Comment ça marche",
    title: "Commander sans gluten, en 3 étapes",
    description: "Pas de compte à créer : quelques minutes suffisent.",
    steps: {
      choose: {
        title: "Je choisis",
        text: "Je parcours les produits de nos artisans ou la carte d'un restaurant partenaire. Chaque fiche affiche son niveau de garantie, sa source et sa date de vérification.",
      },
      order: {
        title: "Je commande",
        text: "J'indique mon nom, mon téléphone et mon adresse, et je paie à la livraison. Pour éviter les abus, un même numéro peut passer au maximum {max} commandes par jour.",
      },
      delivered: {
        title: "Je suis livré·e",
        text: "Le commerçant prépare ma commande, puis elle arrive chez moi. Je peux la suivre à tout moment avec mon numéro de commande.",
      },
    },
    track: "Déjà commandé ? Suivre ma commande",
  },

  // The 3 guarantee levels (also used by the about page)
  guarantees: {
    eyebrow: "Transparence",
    title: "3 niveaux de garantie, affichés sur chaque fiche",
    description:
      "Le sans gluten n'est pas une simple étiquette. Nous indiquons clairement ce qui est certifié, ce qui est naturellement sans gluten et ce qui présente un risque de traces.",
    checkedLabel: "Ce que nous vérifions :",
    checks: {
      CERTIFIED: "le logo, l'organisme certificateur et le numéro de certification.",
      NATURALLY_GF: "la recette, la liste des ingrédients et les précautions de préparation.",
      TRACES_RISK: "l'absence d'ingrédient contenant du gluten. Le risque de contamination est signalé clairement.",
    },
    onSheets: "Sur les fiches :",
    learnMore: "Comprendre la contamination croisée",
  },

  restaurants: {
    eyebrow: "Restaurants conventionnés",
    title: "Un bon repas sans gluten, livré chez vous",
    description:
      "Ces restaurants ont signé une convention avec CeliacCare : leurs plats sans gluten se commandent en ligne. Les pratiques de chaque cuisine sont détaillées sur sa fiche.",
    seeAll: "Voir tous les restaurants",
    emptyTitle: "Nos premiers restaurants partenaires arrivent bientôt",
    emptyText: "Vous connaissez un restaurant qui cuisine sans gluten avec soin ? Parlez-nous-en, nous irons le vérifier.",
    emptyAction: "Proposer un restaurant",
  },

  producers: {
    eyebrow: "Petits producteurs",
    title: "Des artisans tunisiens, pas des grandes marques",
    description:
      "Nous travaillons uniquement avec de petites entreprises locales : boulangeries, pâtissières à domicile, coopératives et épiceries de quartier.",
    seeAll: "Rencontrer les artisans",
    reasons: {
      handmade: {
        title: "Fait main, près de chez vous",
        text: "Des produits préparés en petites quantités, par des personnes que nous connaissons.",
      },
      fairPrice: {
        title: "Un prix plus juste",
        text: "Moins d'intermédiaires : votre achat soutient directement l'artisan.",
      },
      local: {
        title: "Des saveurs d'ici",
        text: "Sorgho, maïs, riz, dattes : des recettes tunisiennes, sans gluten par nature ou par savoir-faire.",
      },
    },
    productCount: {
      zero: "Aucun produit",
      one: "{count} produit",
      two: "{count} produits",
      few: "{count} produits",
      many: "{count} produits",
      other: "{count} produits",
    },
  },

  approach: {
    eyebrow: "Notre démarche",
    title: "Chaque fiche est vérifiée, sourcée et datée",
    text: "Avant d'être publiée, chaque adresse est contrôlée par notre équipe. La source de l'information et la date de vérification sont affichées sur la fiche, et tout est revérifié au moins une fois tous les 12 mois.",
    cardTitle: "Avant chaque publication",
    checks: {
      call: "Appel au commerçant",
      visit: "Visite sur place",
      label: "Lecture de l'étiquette",
      certificate: "Contrôle du certificat",
    },
    points: {
      source: "La source est toujours indiquée",
      date: "La date de vérification est affichée",
      review: "Révision tous les 12 mois et après chaque signalement",
    },
    cta: "Découvrir notre démarche",
  },

  join: {
    eyebrow: "Rejoignez-nous",
    title: "Vous êtes artisan ou restaurateur ?",
    text: "Faites connaître vos produits et vos plats sans gluten aux personnes qui les cherchent, et recevez des commandes en ligne.",
    partnerCta: "Devenir partenaire",
    suggestTitle: "Vous connaissez une bonne adresse ?",
    suggestText: "Proposez-la : nous la vérifierons avant de la publier.",
    suggestCta: "Proposer une adresse",
  },
};

export type HomeDict = typeof home;
