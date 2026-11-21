/**
 * Texts of the "Notre démarche" page (French).
 * The Arabic version (../ar/about.ts) must have exactly the same keys.
 * The 3 guarantee levels and the key figures reuse texts of the home namespace.
 */
export const about = {
  meta: {
    title: "Notre démarche : des fiches sans gluten vérifiées",
    description:
      "Comment CeliacCare vérifie chaque commerce 100\u00a0% sans gluten en Tunisie : sources, dates, niveaux de garantie et révision tous les 12 mois.",
  },

  hero: {
    eyebrow: "Notre démarche",
    title: "Le sans gluten, sans le doute",
    text: "CeliacCare réunit au même endroit des produits et des restaurants sans gluten, vérifiés par des personnes, avec la source et la date de chaque information. Voici d'où nous venons et comment nous travaillons.",
    jumpLabel: "Sur cette page",
    jump: {
      story: "Notre histoire",
      method: "Notre méthode",
      guarantees: "Les 3 garanties",
      team: "L'équipe",
    },
  },

  problem: {
    eyebrow: "Le constat",
    title: "Trouver du sans gluten fiable, un vrai parcours du combattant",
    // \u00a0 = non-breaking space: « and » never end up alone at the start or end of a line
    quote: "«\u00a0Est-ce que c'est vraiment sans gluten\u00a0?\u00a0»",
    quoteText:
      "C'est la question que se posent les personnes cœliaques à chaque achat et à chaque repas pris dehors. Trop souvent, personne ne peut y répondre avec certitude.",
    items: {
      places: {
        title: "Des adresses difficiles à trouver",
        text: "Peu de points de vente fiables, concentrés dans quelques quartiers et rarement connus.",
      },
      scattered: {
        title: "Une information éparpillée",
        text: "Sites de marques, applications de livraison, réseaux sociaux, associations : rien n'est centralisé, rien n'est daté.",
      },
      prices: {
        title: "Des prix élevés",
        text: "Beaucoup de produits sont importés et chers, alors que des artisans tunisiens savent faire aussi bon, plus près de chez vous.",
      },
    },
  },

  story: {
    eyebrow: "Notre histoire",
    title: "Une idée née d'un projet de Design Thinking",
    paragraphs: [
      "CeliacCare est né au sein du Master BioMIS, lors d'un projet de Design Thinking mené par des étudiant·e·s en biotechnologie.",
      "En partant des besoins des personnes cœliaques, de leurs proches et des commerçants, nous avons fait un constat simple : le plus difficile n'est pas seulement de trouver des produits sans gluten, c'est de pouvoir leur faire confiance.",
      "D'où notre idée : une plateforme tunisienne, en français et en arabe, où chaque information est vérifiée par des personnes et où l'on peut commander en quelques clics.",
    ],
    stepsLabel: "Les 5 étapes de notre Design Thinking",
    steps: ["Comprendre", "Définir", "Imaginer", "Prototyper", "Tester"],
    badge: "Master BioMIS",
    badgeText: "Biotechnologie & Design Thinking",
  },

  mission: {
    eyebrow: "Notre mission",
    statement:
      "Permettre à chaque personne cœliaque ou sensible au gluten en Tunisie de trouver, près de chez elle et à un prix juste, des produits et des repas dignes de confiance.",
    valuesTitle: "Nos valeurs",
    values: {
      reliability: {
        title: "Fiabilité",
        text: "Aucune fiche sans source ni date. Et quand il y a un doute, nous l'écrivons.",
      },
      proximity: {
        title: "Proximité",
        text: "Des artisans et des restaurants d'ici, que nous connaissons et que nous visitons.",
      },
      accessibility: {
        title: "Accessibilité",
        text: "Un site simple, en français et en arabe, pensé d'abord pour le téléphone, avec paiement à la livraison.",
      },
      community: {
        title: "Communauté",
        text: "Avis, signalements, suggestions : chacun peut aider à garder l'information juste.",
      },
    },
  },

  // How CeliacCare earns its living (transparency), shown under the values.
  model: {
    title: "Des prix justes, la livraison offerte",
    paragraphs: [
      "Vous payez uniquement le prix fixé par l'artisan ou le restaurant, et la livraison est gratuite partout où nous livrons.",
      "CeliacCare est rémunéré par une commission que les commerçants partenaires versent sur leurs ventes, jamais en augmentant les prix.",
      "Notre objectif : un sans gluten accessible à toutes les familles tunisiennes, pas seulement aux plus aisées.",
    ],
  },

  method: {
    eyebrow: "Notre méthode",
    title: "De la première piste à la fiche publiée",
    description:
      "Chaque adresse suit le même chemin, en quatre étapes. C'est ce qui nous permet d'afficher une information claire, sourcée et à jour.",
    stepLabel: "Étape {number}",
    steps: {
      spotting: {
        title: "Repérage",
        text: "Nous repérons les adresses grâce à nos recherches, aux suggestions de la communauté et aux artisans qui nous contactent.",
      },
      verification: {
        title: "Vérification",
        text: "Nous vérifions chaque information auprès du commerçant, avec au moins l'un de ces moyens :",
        checks: {
          call: "Appel",
          visit: "Visite",
          label: "Étiquette",
          certificate: "Certificat",
        },
      },
      publication: {
        title: "Publication avec source et date",
        text: "La fiche est publiée avec son niveau de garantie, la source de l'information et la date de vérification. Pas de source, pas de publication.",
      },
      review: {
        title: "Révision tous les 12 mois",
        text: "Après 12 mois, une fiche est automatiquement mise en révision. Et chaque signalement d'un visiteur déclenche une nouvelle vérification.",
      },
    },
    quote: "«\u00a0Chaque information publiée doit pouvoir être vérifiée\u00a0: qui l'a dit, comment, et quand.\u00a0»",
    quoteAuthor: "La règle d'or de l'équipe CeliacCare",
  },

  guarantees: {
    eyebrow: "Nos niveaux de garantie",
    title: "Une étiquette honnête sur chaque fiche",
    description:
      "Nous ne référençons que des commerces 100\u00a0% sans gluten, et nous distinguons ceux qui sont certifiés par un organisme officiel de ceux qui ne le sont pas, pour que chacun puisse choisir en connaissance de cause.",
  },

  local: {
    eyebrow: "Petits producteurs",
    title: "Pourquoi uniquement des petits producteurs locaux ?",
    text: "Nous ne référençons pas de grandes marques : elles ont déjà leurs rayons et leurs publicités. CeliacCare met en lumière celles et ceux qui ont le plus besoin de visibilité.",
    reasons: {
      knowhow: {
        title: "Un savoir-faire tunisien",
        text: "Makroudh, bsissa, couscous de sorgho ou droô : des recettes d'ici, préparées sans gluten.",
      },
      relationship: {
        title: "Une relation directe",
        text: "Nous connaissons chaque artisan : nous pouvons poser des questions précises sur les ingrédients et la préparation.",
      },
      shortCircuit: {
        title: "Des circuits courts",
        text: "Un seul intermédiaire, CeliacCare : des prix plus justes et un revenu qui reste dans l'économie locale.",
      },
    },
    cta: "Rencontrer nos artisans",
  },

  numbers: {
    eyebrow: "En chiffres",
    title: "CeliacCare aujourd'hui",
  },

  team: {
    eyebrow: "L'équipe",
    title: "Les personnes derrière CeliacCare",
    description: "Une petite équipe, des rôles clairs et un même objectif : une information fiable.",
    roles: {
      students: {
        title: "Étudiant·e·s en biotechnologie",
        text: "À l'origine du projet (Master BioMIS) : conception de la plateforme, lecture des étiquettes et des certificats.",
      },
      dietitian: {
        title: "Diététicienne partenaire",
        text: "Relit nos contenus sur le régime sans gluten pour qu'ils restent justes, sans jamais remplacer un avis médical.",
      },
      verifiers: {
        title: "Équipe de vérification",
        text: "Appelle les commerçants, visite les ateliers et les cuisines, et date chaque vérification.",
      },
      moderators: {
        title: "Modération & communauté",
        text: "Traite les signalements, modère les avis avant publication et accompagne les artisans partenaires.",
      },
    },
  },

  partners: {
    eyebrow: "Partenariats en cours",
    title: "Ensemble, on va plus loin",
    description:
      "Nous construisons des partenariats avec des acteurs engagés auprès des personnes cœliaques. Nous ne citerons un partenaire qu'une fois l'accord conclu.",
    status: "En cours",
    items: {
      associations: {
        title: "Associations de patients cœliaques",
        text: "Pour relayer leurs conseils et mieux connaître les besoins des familles.",
      },
      health: {
        title: "Professionnels de santé",
        text: "Médecins et diététicien·ne·s, pour des contenus toujours plus justes.",
      },
      laboratories: {
        title: "Laboratoires d'analyse",
        text: "Pour, à terme, faire analyser certains produits : la biotechnologie au service de la confiance.",
      },
    },
    cta: "Proposer un partenariat",
  },

  closing: {
    title: "Le sans gluten, c'est mieux ensemble",
    text: "Découvrez les produits de nos artisans, commandez dans un restaurant partenaire, ou aidez la communauté en proposant une adresse.",
    products: "Découvrir les produits",
    suggest: "Proposer une adresse",
  },
};

export type AboutDict = typeof about;
