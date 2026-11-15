/**
 * Texts of the help and information pages (French): FAQ, gluten-free guide
 * and legal pages. The long texts themselves live in data/faq.ts,
 * data/guide.ts and data/legal.ts.
 */
export const content = {
  shared: {
    onThisPage: "Sur cette page",
    updatedOn: "Mis à jour le {date}",
    readingTime: "{minutes} min de lecture",
    takeaway: "À retenir",
    todo: "À compléter",
    newTab: "(s'ouvre dans un nouvel onglet)",
  },
  /** Small notice shown at the bottom of every page until the visitor closes it (spec 6.4). */
  cookies: {
    label: "Cookies",
    text: "Ce site n'utilise que des cookies essentiels (panier, session).",
    more: "En savoir plus",
    dismiss: "J'ai compris",
  },
  help: {
    title: "Une question reste sans réponse ?",
    text: "Notre équipe vous répond par e-mail, par téléphone ou sur WhatsApp.",
    contact: "Nous écrire",
    whatsapp: "WhatsApp",
  },
  faq: {
    metaTitle: "Questions fréquentes",
    metaDescription:
      "Toutes les réponses sur CeliacCare : commande sans gluten, livraison en Tunisie, paiement à la livraison, 3 commandes par jour, garanties et partenariats.",
    eyebrow: "Aide",
    title: "Questions fréquentes",
    description:
      "Commander, se faire livrer, comprendre nos garanties sans gluten ou nous rejoindre : voici les réponses aux questions qu'on nous pose le plus souvent.",
    topics: "Thèmes de la FAQ",
    questionCount: "{count} questions",
    guideTitle: "Nouveau dans le sans gluten ?",
    guideText:
      "Notre guide explique la maladie cœliaque, les aliments à éviter dans la cuisine tunisienne et les pièges de la contamination croisée.",
    guideCta: "Lire le guide",
    contactTitle: "Pas trouvé votre réponse ?",
    contactText: "Posez-nous directement votre question : nous lisons chaque message.",
    contactCta: "Nous écrire",
  },
  guide: {
    metaTitle: "Guide du sans gluten en Tunisie",
    metaDescription:
      "Le guide pratique pour manger sans gluten en Tunisie : maladie cœliaque, céréales à éviter, plats tunisiens, contamination croisée et étiquettes.",
    eyebrow: "Guide pratique",
    title: "Manger sans gluten en Tunisie",
    description:
      "Maladie cœliaque, aliments à éviter, plats tunisiens, contamination croisée, étiquettes et restaurants : l'essentiel pour vivre sans gluten au quotidien, expliqué simplement.",
    disclaimerTitle: "Ce guide informe, il ne remplace pas un avis médical",
    disclaimerText:
      "Les informations de cette page sont générales. Pour un diagnostic, un régime ou toute question sur votre santé, parlez-en à votre médecin ou à un diététicien.",
    verdicts: {
      avoid: "Contient du gluten",
      ok: "Sans gluten",
      check: "À vérifier",
    },
    nextTitle: "Passer à la pratique",
    nextText: "Des produits et des restaurants sans gluten vérifiés, près de chez vous.",
    next: {
      products: {
        title: "Produits sans gluten",
        text: "Pains, couscous, pâtisseries et épicerie d'artisans tunisiens, livrés chez vous.",
        cta: "Voir les produits",
      },
      restaurants: {
        title: "Restaurants partenaires",
        text: "Des plats sans gluten préparés avec précaution, à commander en ligne.",
        cta: "Voir les restaurants",
      },
      producers: {
        title: "Nos artisans",
        text: "Pâtissières, boulangers et coopératives qui travaillent le sans gluten.",
        cta: "Découvrir les artisans",
      },
    },
  },
  legal: {
    eyebrow: "Informations légales",
    otherPages: "Autres informations légales",
    notice: {
      title: "Mentions légales",
      description: "Qui édite CeliacCare, qui l'héberge, et les règles d'utilisation de son contenu.",
      metaDescription:
        "Mentions légales de CeliacCare : éditeur du site, hébergement, propriété intellectuelle, responsabilité et contact.",
    },
    privacy: {
      title: "Politique de confidentialité",
      description:
        "Quelles données nous collectons, pourquoi, combien de temps nous les gardons et comment exercer vos droits.",
      metaDescription:
        "Comment CeliacCare protège vos données personnelles (loi organique n° 2004-63) : données collectées, durée de conservation, cookies et vos droits.",
    },
    terms: {
      title: "Conditions générales d'utilisation",
      description:
        "Le rôle de CeliacCare et des commerçants, les règles de commande et de livraison, et nos limites de responsabilité.",
      metaDescription:
        "Conditions générales de CeliacCare : rôle de la plateforme et des commerçants, commandes, limite de 3 par jour, paiement à la livraison et responsabilité.",
    },
  },
};

export type ContentDict = typeof content;
